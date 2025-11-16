import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Combo } from './entities/combo.entity';
import { Brackets, DataSource, Repository } from 'typeorm';
import { CreateComboReqDto } from './dtos/create-combo.dto';
import { RoomType } from 'modules/room-type/entities/room-type.entity';
import { Service } from 'modules/service/entities/service.entity';
import { ComboService as ComboServiceEntity } from './entities/combo-service.entity';
import { GetComboForAdminReqDto, GetComboReqDto } from './dtos/get-combo.dto';
import { UpdateComboReqDto } from './dtos/update-combo.dto';

@Injectable()
export class ComboService {
  constructor(
    @InjectRepository(Combo)
    private readonly comboRepository: Repository<Combo>,
    private readonly dataSource: DataSource,
  ) {}

  async getCombos(query: GetComboReqDto) {
    return this.comboRepository.findAndCount({
      where: {
        isActive: 1,
      },
      relations: ['roomType'],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getCombosForAdmin(query: GetComboForAdminReqDto) {
    return this.comboRepository
      .createQueryBuilder('combo')
      .innerJoinAndSelect('combo.roomType', 'roomType')
      .where(
        new Brackets((qb) => {
          if (typeof query.isActive === 'number') {
            qb.where('combo.isActive = :isActive', {
              isActive: query.isActive,
            });
          }
        }),
      )
      .orderBy('combo.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
  }

  async createCombo(body: CreateComboReqDto) {
    const now = new Date();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const roomType = await queryRunner.manager.findOne(RoomType, {
        where: {
          id: body.roomTypeId,
        },
        relations: ['rooms'],
      });
      if (!roomType) {
        throw new NotFoundException('Room type not found');
      }
      const combo = queryRunner.manager.create(Combo, {
        roomTypeId: body.roomTypeId,
        name: body.name,
        description: body.description ?? null,
        discountValue: body.discountValue.toFixed(2),
        maxDiscountAmount: body.maxDiscountAmount,
        minStayNights: body.minStayNights,
        comboServices: [],
        isActive: 0,
        createdAt: now,
        updatedAt: now,
      });
      for (const serviceId of body.serviceIds) {
        const service = await queryRunner.manager.findOne(Service, {
          where: {
            id: serviceId,
            status: 'active',
          },
        });
        if (!service) {
          throw new NotFoundException(
            `Service with ID ${serviceId} not found or inactive`,
          );
        }
        combo.comboServices.push(
          queryRunner.manager.create(ComboServiceEntity, {
            serviceId,
            createdAt: now,
          }),
        );
      }
      const result = await queryRunner.manager.save(combo);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateCombo(comboId: number, body: UpdateComboReqDto) {
    const combo = await this.comboRepository.findOne({
      where: {
        id: comboId,
      },
    });
    if (!combo) {
      throw new NotFoundException('Combo not found');
    }
    if (body.name === undefined && body.description === undefined) {
      throw new BadRequestException(
        'At least one of name, description must be provided for update',
      );
    }
    return this.comboRepository.update(comboId, body);
  }

  async publicationCombo(comboId: number, isActive: number) {
    const voucher = await this.comboRepository.findOne({
      where: {
        id: comboId,
      },
    });
    if (!voucher) {
      throw new NotFoundException('Combo not found');
    }
    return this.comboRepository.update(comboId, { isActive });
  }
}
