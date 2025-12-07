import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import {
  DataSource,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { UserVoucher } from './entities/user-voucher.entity';
import { CreateVoucherReqDto } from './dtos/create-voucher.dto';
import * as moment from 'moment';
import { UpdateVoucherReqDto } from './dtos/update-voucher.dto';
import { UserTier } from 'modules/user/entities/user-tier.entity';
import { GetVoucherReqDto } from './dtos/get-voucher.dto';
import { User } from 'modules/user/entities/user.entity';
import * as _ from 'lodash';
import { ConfigService } from 'common/config/config.service';
import { MailService } from 'common/mail/mail.service';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(UserVoucher)
    private readonly userVoucherRepository: Repository<UserVoucher>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async getPublishedVouchers(query: GetVoucherReqDto) {
    const now = new Date();
    const vouchers = await this.voucherRepository.find({
      where: {
        isActive: 1,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      relations: ['userTiers'],
    });
    const result = vouchers.map((voucher) =>
      _.omit(voucher, ['userVouchers', 'isActive']),
    );
    return [
      result.slice((query.page - 1) * query.limit, query.page * query.limit),
      result.length,
    ];
  }

  async getVouchersForAdmin(query: GetVoucherReqDto) {
    return this.voucherRepository.findAndCount({
      relations: ['userTiers'],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  }

  async getVouchersForCustomer(userId: number, query: GetVoucherReqDto) {
    return this.dataSource.manager.findAndCount(UserVoucher, {
      where: {
        userId,
      },
      relations: ['voucher'],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  }

  async createVoucher(body: CreateVoucherReqDto) {
    const userTiers = await Promise.all(
      body.userTierIds.map(
        async (tierId) =>
          await this.dataSource.manager.findOne(UserTier, {
            where: {
              id: tierId,
            },
          }),
      ),
    );
    if (userTiers.includes(undefined)) {
      throw new BadRequestException('One or more user tiers are invalid');
    }
    if (Number(body.discountValue) <= 0) {
      throw new BadRequestException('Discount value must be greater than zero');
    }
    if (Number(body.maxDiscountAmount) <= 0) {
      throw new BadRequestException(
        'Max discount amount must be greater than zero',
      );
    }
    if (moment(body.endDate).isBefore(moment(body.startDate))) {
      throw new BadRequestException('End date must be after start date');
    }
    const voucher = this.voucherRepository.create({
      name: body.name,
      description: body.description,
      discountType: body.discountType,
      discountValue: body.discountValue,
      maxDiscountAmount: body.maxDiscountAmount,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      claimLimit: body.claimLimit,
      minBookingAmount: body.minBookingAmount,
      userTiers,
      isActive: 0,
    });
    return this.voucherRepository.save(voucher);
  }

  async claimVoucher(userId: number, voucherId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await queryRunner.manager.findOne(User, {
        where: {
          id: userId,
        },
      });
      const voucher = await queryRunner.manager.findOne(Voucher, {
        where: {
          id: voucherId,
          isActive: 1,
        },
        relations: ['userTiers'],
      });
      if (!voucher) {
        throw new NotFoundException('Voucher not found');
      }
      if (
        moment().isAfter(moment(voucher.endDate)) ||
        moment().isBefore(moment(voucher.startDate))
      ) {
        throw new ConflictException('Voucher is not active currently');
      }
      if (voucher.userTiers.every((tier) => tier.id !== user.userTierId)) {
        throw new ConflictException(
          'User tier is not eligible to claim this voucher',
        );
      }
      if (voucher.claimLimit <= 0) {
        throw new ConflictException('Voucher claim limit has been reached');
      }
      const existingUserVoucher = await queryRunner.manager.findOne(
        UserVoucher,
        {
          where: {
            userId,
            voucherId,
          },
        },
      );
      if (existingUserVoucher) {
        throw new ConflictException('User has already claimed this voucher');
      }
      const userVoucher = queryRunner.manager.create(UserVoucher, {
        userId,
        voucherId,
      });
      const newUserVoucher = await queryRunner.manager.save(userVoucher);
      await queryRunner.manager.update(Voucher, voucherId, {
        claimLimit: voucher.claimLimit - 1,
      });
      await queryRunner.commitTransaction();
      return newUserVoucher;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateVoucher(voucherId: number, body: UpdateVoucherReqDto) {
    const voucher = await this.voucherRepository.findOne({
      where: {
        id: voucherId,
      },
    });
    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }
    let partialBody: typeof body & { userTiers?: UserTier[] } = { ...body };
    if (body.userTierIds && body.userTierIds.length > 0) {
      partialBody = {
        ...partialBody,
        userTiers: [],
      };
      for (const tierId of body.userTierIds) {
        const tier = await this.dataSource.manager.findOne(UserTier, {
          where: {
            id: tierId,
          },
        });
        if (!tier) {
          throw new BadRequestException(
            `User tier with id ${tierId} does not exist`,
          );
        }
        partialBody.userTiers.push(tier);
      }
      voucher.userTiers = partialBody.userTiers;
    }
    if (
      body.name === undefined &&
      body.description === undefined &&
      body.claimLimit === undefined &&
      body.userTierIds === undefined
    ) {
      throw new BadRequestException(
        'At least one of name, description or claimLimit must be provided for update',
      );
    }
    return this.voucherRepository.save(voucher);
  }

  async deleteVoucher(voucherId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const voucher = await queryRunner.manager.findOne(Voucher, {
        where: {
          id: voucherId,
        },
        relations: ['userVouchers'],
      });
      if (!voucher) {
        throw new NotFoundException('Voucher not found');
      }
      if (voucher.userVouchers && voucher.userVouchers.length > 0) {
        throw new ConflictException(
          'Cannot delete voucher that has been used by users',
        );
      }
      voucher.userTiers = [];
      await queryRunner.manager.save(voucher);
      const result = await queryRunner.manager.delete(Voucher, voucherId);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async publicationVoucher(voucherId: number, isActive: number) {
    const voucher = await this.voucherRepository.findOne({
      where: {
        id: voucherId,
      },
      relations: ['userTiers', 'userTiers.users'],
    });
    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    if (isActive) {
      // Gửi thông báo mail đến các đối tượng được săn voucher này
      for (const user of voucher.userTiers.map((ut) => ut.users).flat()) {
        await this.mailService.voucherReleasedNotify(user.email, {
          ...voucher,
          startDate: moment(voucher.startDate).format('MMMM D, YYYY'),
          endDate: moment(voucher.endDate).format('MMMM D, YYYY'),
          appliedObjects: voucher.userTiers.map((ut) => ut.tierName).join(', '),
          host: this.configService.getServerConfig().frontendUrl,
        });
      }
    }

    return this.voucherRepository.update(voucherId, { isActive });
  }
}
