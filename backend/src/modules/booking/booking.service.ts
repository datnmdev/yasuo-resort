import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { BookingRoomReqDto } from './dtos/booking-room.dto';
import * as moment from 'moment';
import { Room } from 'modules/room/entities/room.entity';
import { Service } from 'modules/service/entities/service.entity';
import { BookingService as BookingServiceEntity } from './entities/booking-service.entity';
import { BookingServicesReqDto } from './dtos/booking-service.dto';
import * as ejs from 'ejs';
import * as path from 'path';
import * as fs from 'fs/promises';
import { htmlToPdf } from 'utils/puppeteer.util';
import { hasSignature } from 'utils/sharp.util';
import { toPascalCase } from 'utils/string.util';
import { Role } from 'common/constants/user.constants';
import { GetBookingReqDto } from './dtos/get-bookings.dto';
import * as _ from 'lodash';
import { ChangeRoomReqDto } from './dtos/change-room.dto';
import { RoomChangeHistory } from './entities/room-change-history.entity';
import { UpdateServiceBookingReqDto } from './dtos/update-service-booking.dto';
import { UserVoucher } from 'modules/voucher/entities/user-voucher.entity';
import { Combo } from 'modules/combo/entities/combo.entity';
import { MailService } from 'common/mail/mail.service';
import { ConfigService } from 'common/config/config.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingServiceEntity)
    private readonly bookingServiceRepository: Repository<BookingServiceEntity>,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async getBookings(query: GetBookingReqDto) {
    const result = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.contract', 'contract')
      .leftJoinAndSelect('booking.room', 'room')
      .leftJoinAndSelect('room.type', 'type')
      .leftJoinAndSelect('booking.bookingServices', 'bookingServices')
      .leftJoinAndSelect('bookingServices.service', 'service')
      .leftJoinAndSelect('booking.roomChangeHistories', 'roomChangeHistories')
      .leftJoinAndSelect('roomChangeHistories.fromRoom', 'fromRoom')
      .leftJoinAndSelect('roomChangeHistories.toRoom', 'toRoom')
      .where(
        new Brackets((qb) => {
          if (typeof query.id === 'number' && query.id > 0) {
            qb.where('booking.id = :bookingId', {
              bookingId: query.id,
            });
          }
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          if (typeof query.userId === 'number') {
            qb.where('booking.user_id = :userId', {
              userId: query.userId,
            });
          }
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          if (typeof query.roomId === 'number') {
            qb.where('booking.room_id = :roomId', {
              roomId: query.roomId,
            });
          }
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          if (query.status instanceof Array) {
            query.status.forEach((e, i) => {
              if (i === 0) {
                qb.where(`booking.status = :status0`, {
                  status0: e,
                });
              } else {
                qb.orWhere(`booking.status = :status${i}`, {
                  [`status${i}`]: e,
                });
              }
            });
          }
        }),
      )
      .orderBy('booking.id', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return [
      result[0].map((item) => _.omit(item, 'user.passwordHash')),
      result[1],
    ];
  }

  async bookingRoom(userId: number, bookingRoomBody: BookingRoomReqDto) {
    const now = new Date();
    // Kiểm tra tính hợp lệ của start date và end date
    if (
      moment(bookingRoomBody.startDate).valueOf() < now.getTime() ||
      moment(bookingRoomBody.endDate).valueOf() <= now.getTime()
    ) {
      throw new BadRequestException({
        message: 'The contract signing date and end date must be in the future',
        error: 'BadRequest',
      });
    }
    const totalRentalDays =
      moment(bookingRoomBody.endDate).diff(
        moment(bookingRoomBody.startDate),
        'days',
      ) + 1;
    if (totalRentalDays < 0) {
      throw new BadRequestException({
        message: 'The contract end date must be later than the signing date',
        error: 'BadRequest',
      });
    }

    // Kiểm tra danh sách dịch vụ đặt kèm (nếu có)
    if (
      bookingRoomBody.attachedService &&
      bookingRoomBody.attachedService.length > 0
    ) {
      for (const e of bookingRoomBody.attachedService) {
        if (
          e.startDate &&
          !moment(e.startDate).isBetween(
            moment(bookingRoomBody.startDate),
            moment(bookingRoomBody.endDate),
            'days',
            '[]',
          )
        ) {
          throw new BadRequestException({
            message: 'Start date must be within the booking period',
            error: 'BadRequest',
          });
        }

        if (
          e.endDate &&
          !moment(e.endDate).isBetween(
            moment(bookingRoomBody.startDate),
            moment(bookingRoomBody.endDate),
            'days',
            '[]',
          )
        ) {
          throw new BadRequestException({
            message: 'Start date must be within the booking period',
            error: 'BadRequest',
          });
        }

        if (
          e.startDate &&
          e.endDate &&
          moment(e.startDate).isAfter(moment(e.endDate))
        ) {
          throw new BadRequestException({
            message: 'Start date must be before or same end date',
            error: 'BadRequest',
          });
        }
        const serviceInfo = await this.dataSource.manager.findOne(Service, {
          where: {
            id: e.id,
            status: 'active',
          },
        });
        if (!serviceInfo) {
          throw new BadRequestException({
            message: `Invalid service ID: ${e.id}`,
            error: 'BadRequest',
          });
        }
      }
    }

    // Kiểm tra voucher người dùng (nếu có)
    if (typeof bookingRoomBody.userVoucherId === 'number') {
      const userVoucher = await this.dataSource.manager.findOne(UserVoucher, {
        where: {
          id: bookingRoomBody.userVoucherId,
          userId,
          dateUsed: null,
        },
      });
      if (!userVoucher) {
        throw new BadRequestException({
          message: 'Invalid user voucher ID',
          error: 'BadRequest',
        });
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const roomInfo = await queryRunner.manager.findOne(Room, {
        where: {
          id: bookingRoomBody.roomId,
        },
        relations: ['type'],
      });

      // Kiểm tra số người có hợp lệ không
      if (bookingRoomBody.capacity > roomInfo.maxPeople) {
        throw new BadRequestException({
          message: `No more than ${roomInfo.maxPeople} people are allowed`,
          error: 'BadRequest',
        });
      }

      // Kiểm tra tính hợp lệ của roomId
      if (!roomInfo) {
        throw new BadRequestException({
          message: 'Invalid room ID',
          error: 'BadRequest',
        });
      }

      // Kiểm tra combo (nếu có)
      if (typeof bookingRoomBody.comboId === 'number') {
        const combo = await this.dataSource.manager.findOne(Combo, {
          where: {
            id: bookingRoomBody.comboId,
            isActive: 1,
            roomTypeId: roomInfo.typeId,
          },
        });
        if (!combo) {
          throw new BadRequestException({
            message: 'Invalid combo ID for the selected room type',
            error: 'BadRequest',
          });
        }

        if (totalRentalDays < combo.minStayNights) {
          throw new BadRequestException({
            message: `The selected combo requires a minimum stay of ${combo.minStayNights} nights`,
            error: 'BadRequest',
          });
        }
      }

      // Kiểm tra phòng này có sẵn sàng để đặt không
      if (roomInfo.status != 'active') {
        throw new ConflictException(
          'This room is currently not available for booking',
        );
      }

      // Kiểm tra phòng này trong khoảng thời gian từ start date đến end date có ai đặt chưa
      const booking = await queryRunner.manager
        .createQueryBuilder(Booking, 'booking')
        .where('booking.room_id = :roomId', {
          roomId: roomInfo.id,
        })
        .andWhere(
          `booking.status != 'cancelled' AND booking.status != 'rejected' AND booking.start_date < :endDate AND booking.end_date > :startDate`,
          {
            startDate: bookingRoomBody.startDate,
            endDate: bookingRoomBody.endDate,
          },
        )
        .getOne();
      if (booking) {
        throw new ConflictException(
          'This room has already been booked during this time period',
        );
      }

      // Tạo entity booking
      const bookingEntity = this.bookingRepository.create({
        userId,
        roomId: bookingRoomBody.roomId,
        roomNumber: roomInfo.roomNumber,
        capacity: bookingRoomBody.capacity,
        roomPrice: roomInfo.price,
        startDate: moment(bookingRoomBody.startDate).format('YYYY-MM-DD'),
        endDate: moment(bookingRoomBody.endDate).format('YYYY-MM-DD'),
        status: 'pending',
        createdAt: now,
      });

      // Tính tổng tiền đặt phòng + dịch vụ kèm theo (nếu có) + ưu đãi combo (nếu có)
      let totalPrice = Number(roomInfo.price) * totalRentalDays; // Tiền phòng
      // TÍnh giá ưu đãi nếu đặt theo combo
      if (typeof bookingRoomBody.comboId === 'number') {
        bookingEntity.comboId = bookingRoomBody.comboId;
        bookingEntity.bookingServices = [];
        const combo = await this.dataSource.manager.findOne(Combo, {
          where: {
            id: bookingRoomBody.comboId,
          },
          relations: ['comboServices', 'comboServices.service'],
        });
        for (const comboService of combo.comboServices) {
          const servicePrice = Number(comboService.service.price);
          totalPrice +=
            bookingRoomBody.capacity * totalRentalDays * servicePrice;

          // Lưu thông tin dịch vụ đặt kèm từ combo
          bookingEntity.bookingServices.push(
            queryRunner.manager.create(BookingServiceEntity, {
              serviceId: comboService.serviceId,
              price: servicePrice.toFixed(2),
              quantity: bookingRoomBody.capacity,
              status: 'pending',
              startDate: bookingRoomBody.startDate,
              endDate: bookingRoomBody.endDate,
              isBookedViaCombo: 1,
              createdAt: now,
            }),
          );
        }
        const discountAmount = (totalPrice * Number(combo.discountValue)) / 100;
        totalPrice =
          totalPrice -
          (discountAmount > Number(combo.maxDiscountAmount)
            ? Number(combo.maxDiscountAmount)
            : discountAmount);
      }
      // Tính giá dịch vụ bổ sung (nếu có)
      if (
        bookingRoomBody.attachedService &&
        bookingRoomBody.attachedService.length > 0
      ) {
        if (!bookingEntity.bookingServices) {
          bookingEntity.bookingServices = [];
        }
        for (const e of bookingRoomBody.attachedService) {
          const serviceInfo = await queryRunner.manager.findOne(Service, {
            where: {
              id: e.id,
            },
          });
          const serviceRentalDays =
            moment(e.endDate).diff(moment(e.startDate), 'days') + 1;
          totalPrice +=
            e.quantity * serviceRentalDays * Number(serviceInfo.price);

          // Lưu thông tin dịch vụ đặt kèm từ yêu cầu người dùng
          bookingEntity.bookingServices.push(
            queryRunner.manager.create(BookingServiceEntity, {
              serviceId: e.id,
              price: serviceInfo.price,
              quantity: e.quantity,
              status: 'pending',
              startDate: e.startDate,
              endDate: e.endDate,
              createdAt: now,
            }),
          );
        }
      }

      // Áp dụng voucher (nếu có)
      if (typeof bookingRoomBody.userVoucherId === 'number') {
        const userVoucher = await queryRunner.manager.findOne(UserVoucher, {
          where: {
            id: bookingRoomBody.userVoucherId,
          },
          relations: ['voucher'],
        });
        let discountAmount =
          userVoucher.voucher.discountType === 'fixed_amount'
            ? Number(userVoucher.voucher.discountValue)
            : (totalPrice * Number(userVoucher.voucher.discountValue)) / 100;
        if (discountAmount > Number(userVoucher.voucher.maxDiscountAmount)) {
          discountAmount = Number(userVoucher.voucher.maxDiscountAmount);
        }
        if (discountAmount > totalPrice) {
          discountAmount = totalPrice;
        }
        totalPrice -= discountAmount;
        bookingEntity.userVoucherId = bookingRoomBody.userVoucherId;

        // Đánh dấu voucher đã được sử dụng
        await queryRunner.manager.update(
          UserVoucher,
          {
            id: bookingRoomBody.userVoucherId,
          },
          {
            dateUsed: now,
          },
        );
      }
      bookingEntity.totalPrice = totalPrice.toFixed(2);

      const newBooking = await queryRunner.manager.save(bookingEntity);
      await queryRunner.commitTransaction();
      return newBooking;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectRoomBooking(bookingId: number, reason: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const booking = await queryRunner.manager.findOne(Booking, {
        where: {
          id: bookingId,
        },
        relations: ['bookingServices', 'user'],
      });
      if (booking) {
        if (booking.status === 'pending' && !booking.contract) {
          // Cập nhật trạng thái đặt phòng
          const result = await queryRunner.manager.update(
            Booking,
            {
              id: bookingId,
            },
            {
              status: 'rejected',
              reasonForRejection: reason,
            },
          );

          // Huỷ bỏ các dịch vụ đã đặt
          if (booking.bookingServices.length > 0) {
            const bookingServiceEntities = booking.bookingServices.map((item) =>
              queryRunner.manager.create(BookingServiceEntity, {
                ...item,
                status: 'rejected',
              }),
            );
            await queryRunner.manager.save(bookingServiceEntities);
          }

          // Gửi mail thông báo
          await this.mailService.bookingRejectNotify(booking.user.email, {
            ...booking,
            startDate: moment(booking.startDate).format('MMMM D, YYYY'),
            endDate: moment(booking.endDate).format('MMMM D, YYYY'),
            host: this.configService.getServerConfig().frontendUrl,
            reasonForRejection: reason,
          });

          await queryRunner.commitTransaction();
          return result;
        } else if (booking.status === 'confirmed') {
          throw new ForbiddenException('Cannot reject a confirmed booking');
        } else if (booking.status === 'cancelled') {
          throw new ForbiddenException('Cannot reject a cancelled booking');
        }
        throw new BadRequestException('This booking has already been rejected');
      }
      throw new ForbiddenException(
        'You are not allowed to modify this resource',
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelRoomBooking(userId: number, bookingId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const booking = await queryRunner.manager.findOne(Booking, {
        where: {
          userId,
          id: bookingId,
        },
        relations: ['bookingServices'],
      });
      if (booking) {
        if (booking.status === 'pending') {
          const result = await queryRunner.manager.update(
            Booking,
            {
              id: bookingId,
            },
            {
              status: 'cancelled',
            },
          );

          // Huỷ bỏ các dịch vụ đã đặt
          if (booking.bookingServices.length > 0) {
            const bookingServiceEntities = booking.bookingServices.map((item) =>
              queryRunner.manager.create(BookingServiceEntity, {
                ...item,
                status: 'cancelled',
              }),
            );
            await queryRunner.manager.save(bookingServiceEntities);
          }

          await queryRunner.commitTransaction();
          return result;
        } else if (booking.status === 'confirmed') {
          throw new ForbiddenException('Cannot cancel a confirmed booking');
        } else if (booking.status === 'rejected') {
          throw new ForbiddenException('Cannot cancel a rejected booking');
        }
        throw new BadRequestException(
          'This booking has already been cancelled',
        );
      }
      throw new ForbiddenException(
        'You are not allowed to modify this resource',
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createContract(bookingId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const booking = await queryRunner.manager.findOne(Booking, {
        where: {
          id: bookingId,
        },
        relations: [
          'room',
          'user',
          'room.type',
          'bookingServices',
          'bookingServices.service',
          'roomChangeHistories',
          'roomChangeHistories.fromRoom',
          'roomChangeHistories.toRoom',
        ],
      });
      if (booking) {
        if (booking.status === 'rejected') {
          throw new ConflictException(
            'Cannot create contract for a rejected booking',
          );
        }
        const contract = await queryRunner.manager.findOne(Contract, {
          where: {
            bookingId,
          },
        });
        if (contract) {
          throw new ConflictException(
            'Contract already exists for this booking',
          );
        }

        // Tạo file hợp đồng
        const now = Date.now();
        const adminSignature = `data:image/png;base64,${(await fs.readFile(path.join(process.cwd(), 'src/assets/images/director-signature.png'))).toString('base64')}`;
        const bookedServices = booking.bookingServices.map((item, index) => ({
          ...item,
          index: index + 1,
          startDate: moment(item.startDate).format('DD-MM-YYYY'),
          endDate: moment(item.endDate).format('DD-MM-YYYY'),
          totalPrice: String(
            Math.ceil(
              moment(item.endDate).diff(moment(item.startDate), 'days') *
                Number(item.price) *
                item.quantity *
                100,
            ) / 100,
          ),
        }));
        const roomChangeHistories = booking.roomChangeHistories
          .sort((item1, item2) =>
            moment(item1.changeDate).diff(moment(item2.changeDate), 'days'),
          )
          .map((item, index, arr) => ({
            ...item,
            index: index + 1,
            changeDate: moment(item.changeDate).format('DD-MM-YYYY'),
            periodOfTime:
              index < arr.length - 1
                ? `Từ ${moment(item.changeDate).format('DD-MM-YYYY')} đến hết ${moment(arr[index + 1].changeDate).format('DD-MM-YYYY')}`
                : `Từ ${moment(item.changeDate).format('DD-MM-YYYY')} đến ${moment(booking.endDate).format('DD-MM-YYYY')}`,
          }));
        const contractHTML = await ejs.renderFile(
          path.join(process.cwd(), 'src/assets/templates/contract.ejs'),
          {
            now: {
              day: moment(now).format('DD'),
              month: moment(now).format('MM'),
              year: moment(now).format('YYYY'),
            },
            booking: {
              ...booking,
              startDate: {
                day: moment(booking.startDate).format('DD'),
                month: moment(booking.startDate).format('MM'),
                year: moment(booking.startDate).format('YYYY'),
              },
              endDate: {
                day: moment(booking.endDate).format('DD'),
                month: moment(booking.endDate).format('MM'),
                year: moment(booking.endDate).format('YYYY'),
              },
            },
            user: {
              ...booking.user,
              dob: {
                day: moment(booking.user.dob).format('DD'),
                month: moment(booking.user.dob).format('MM'),
                year: moment(booking.user.dob).format('YYYY'),
              },
              identityIssuedAt: {
                day: moment(booking.user.identityIssuedAt).format('DD'),
                month: moment(booking.user.identityIssuedAt).format('MM'),
                year: moment(booking.user.identityIssuedAt).format('YYYY'),
              },
            },
            bookedServices,
            roomChangeHistories,
            totalBookedServicePrice: String(
              Math.ceil(
                bookedServices.reduce(
                  (acc, curr) => acc + Number(curr.totalPrice),
                  0,
                ) * 100,
              ) / 100,
            ),
            adminSignature,
          },
          {
            async: true,
          },
        );
        const fileName = `${booking.id}_${toPascalCase(booking.user.name)}_Contract`;
        const fileRelativePath = path.join('uploads', `${fileName}.html`);
        await fs.writeFile(
          path.join(process.cwd(), fileRelativePath),
          contractHTML,
        );
        await htmlToPdf(
          path.join(process.cwd(), fileRelativePath),
          path.join(process.cwd(), path.join('uploads', `${fileName}.pdf`)),
        );
        await fs.unlink(path.join(process.cwd(), fileRelativePath));

        // Lưu thông tin hợp đồng
        const contractEntity = queryRunner.manager.create(Contract, {
          bookingId,
          signedByAdmin: adminSignature,
          contractUrl: path.join('uploads', `${fileName}.pdf`),
        });
        const newContract = await queryRunner.manager.save(contractEntity);

        // Gửi mail thông báo
        await this.mailService.signContractNotify(booking.user.email, {
          host: this.configService.getServerConfig().frontendUrl,
          contract: {
            ...newContract,
            createdAt: moment(newContract.createdAt).format('MMMM D, YYYY'),
          },
          user: booking.user,
        });

        await queryRunner.commitTransaction();
        return _.omit(newContract, ['signedByAdmin', 'signedByUser']);
      }
      throw new BadRequestException({
        message: 'Invalid booking ID param',
        error: 'BadRequest',
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async signContract(userId: number, bookingId: number, signatureUrl: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Kiểm tra chữ ký
      const signaturePath = path.join(process.cwd(), signatureUrl);
      try {
        await fs.access(signaturePath);
      } catch {
        throw new BadRequestException({
          error: 'InvalidSignature',
          message: 'Invalid signature',
        });
      }
      if (!(await hasSignature(signaturePath))) {
        await fs.unlink(signaturePath);
        throw new BadRequestException({
          error: 'InvalidSignature',
          message: 'Invalid signature',
        });
      }

      // Kiểm tra thông tin người dùng
      const booking = await queryRunner.manager.findOne(Booking, {
        where: {
          id: bookingId,
          userId,
        },
        relations: [
          'contract',
          'room',
          'user',
          'room.type',
          'bookingServices',
          'bookingServices.service',
          'roomChangeHistories',
          'roomChangeHistories.fromRoom',
          'roomChangeHistories.toRoom',
        ],
      });
      if (!booking) {
        await fs.unlink(signaturePath);
        throw new BadRequestException({
          error: 'BadRequest',
          message: 'Invalid booking ID',
        });
      }

      // Kiểm tra phòng đã đặt bởi khách hàng có bị huỷ không
      if (booking.status === 'rejected') {
        await fs.unlink(signaturePath);
        throw new ConflictException(
          'Cannot create contract for a rejected booking',
        );
      }

      // Kiểm tra admin đã xác nhận và tạo hợp đồng trước đó chưa
      if (!booking.contract) {
        await fs.unlink(signaturePath);
        throw new NotFoundException('The contract not found');
      }

      // Kiểm tra hợp đồng đã ký chưa
      if (booking.contract.signedByUser) {
        await fs.unlink(signaturePath);
        throw new ConflictException('The contract has already been signed');
      }

      // Áp dụng chữ ký lên hợp đồng
      const userSignature = `data:image/png;base64,${(await fs.readFile(signaturePath)).toString('base64')}`;
      const bookedServices = booking.bookingServices.map((item, index) => ({
        ...item,
        index: index + 1,
        startDate: moment(item.startDate).format('DD-MM-YYYY'),
        endDate: moment(item.endDate).format('DD-MM-YYYY'),
        totalPrice: String(
          Math.ceil(
            moment(item.endDate).diff(moment(item.startDate), 'days') *
              Number(item.price) *
              item.quantity *
              100,
          ) / 100,
        ),
      }));
      const roomChangeHistories = booking.roomChangeHistories
        .sort((item1, item2) =>
          moment(item1.changeDate).diff(moment(item2.changeDate), 'days'),
        )
        .map((item, index, arr) => ({
          ...item,
          index: index + 1,
          changeDate: moment(item.changeDate).format('DD-MM-YYYY'),
          periodOfTime:
            index < arr.length - 1
              ? `Từ ${moment(item.changeDate).format('DD-MM-YYYY')} đến hết ${moment(arr[index + 1].changeDate).format('DD-MM-YYYY')}`
              : `Từ ${moment(item.changeDate).format('DD-MM-YYYY')} đến hết ${moment(booking.endDate).format('DD-MM-YYYY')}`,
        }));
      const contractHTML = await ejs.renderFile(
        path.join(process.cwd(), 'src/assets/templates/contract.ejs'),
        {
          now: {
            day: moment(booking.contract.createdAt).format('DD'),
            month: moment(booking.contract.createdAt).format('MM'),
            year: moment(booking.contract.createdAt).format('YYYY'),
          },
          booking: {
            ...booking,
            startDate: {
              day: moment(booking.startDate).format('DD'),
              month: moment(booking.startDate).format('MM'),
              year: moment(booking.startDate).format('YYYY'),
            },
            endDate: {
              day: moment(booking.endDate).format('DD'),
              month: moment(booking.endDate).format('MM'),
              year: moment(booking.endDate).format('YYYY'),
            },
          },
          user: {
            ...booking.user,
            dob: {
              day: moment(booking.user.dob).format('DD'),
              month: moment(booking.user.dob).format('MM'),
              year: moment(booking.user.dob).format('YYYY'),
            },
            identityIssuedAt: {
              day: moment(booking.user.identityIssuedAt).format('DD'),
              month: moment(booking.user.identityIssuedAt).format('MM'),
              year: moment(booking.user.identityIssuedAt).format('YYYY'),
            },
          },
          bookedServices,
          roomChangeHistories,
          totalBookedServicePrice: String(
            Math.ceil(
              bookedServices.reduce(
                (acc, curr) => acc + Number(curr.totalPrice),
                0,
              ) * 100,
            ) / 100,
          ),
          adminSignature: booking.contract.signedByAdmin,
          userSignature,
        },
        {
          async: true,
        },
      );
      const fileName = `${booking.id}_${toPascalCase(booking.user.name)}_Contract`;
      const fileRelativePath = path.join('uploads', `${fileName}.html`);
      await fs.writeFile(
        path.join(process.cwd(), fileRelativePath),
        contractHTML,
      );
      await htmlToPdf(
        path.join(process.cwd(), fileRelativePath),
        path.join(process.cwd(), path.join('uploads', `${fileName}.pdf`)),
      );
      await fs.unlink(path.join(process.cwd(), fileRelativePath));
      await fs.unlink(signaturePath);

      // Cập nhật lại trạng thái hợp đồng
      await queryRunner.manager.update(
        Contract,
        { bookingId },
        {
          signedByUser: userSignature,
        },
      );

      // // Cập nhật lại trạng thái đặt phòng
      // await queryRunner.manager.update(
      //   Booking,
      //   {
      //     id: bookingId,
      //   },
      //   {
      //     status: 'confirmed',
      //   },
      // );

      // // Cập nhật lại trạng thái dịch vụ đã đặt kèm (từ combo hoặc bổ sung bởi khách hàng)
      // if (booking.bookingServices.length > 0) {
      //   const bookingServiceEntities = booking.bookingServices
      //     .filter(
      //       (i) =>
      //         i.status === 'pending' &&
      //         i.createdAt.getTime() === booking.createdAt.getTime(),
      //     )
      //     .map((item) =>
      //       queryRunner.manager.create(BookingServiceEntity, {
      //         ...item,
      //         status: 'confirmed',
      //       }),
      //     );
      //   await queryRunner.manager.save(bookingServiceEntities);
      // }

      await queryRunner.commitTransaction();
      return null;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async bookingServices(
    role: Role,
    userId: number,
    body: BookingServicesReqDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let booking: Booking;
      if (role === Role.ADMIN) {
        booking = await queryRunner.manager.findOne(Booking, {
          where: {
            id: body.bookingId,
            userId,
          },
        });
      } else {
        booking = await queryRunner.manager.findOne(Booking, {
          where: {
            id: body.bookingId,
            userId,
          },
        });
      }

      if (booking) {
        // Kiểm tra thông tin dịch vụ đặt
        for (const service of body.services) {
          if (
            service.startDate &&
            !moment(service.startDate).isBetween(
              moment(booking.startDate),
              moment(booking.endDate),
              'days',
              '[]',
            )
          ) {
            throw new BadRequestException({
              message: 'Start date must be within the booking period',
              error: 'BadRequest',
            });
          }

          if (
            service.endDate &&
            !moment(service.endDate).isBetween(
              moment(booking.startDate),
              moment(booking.endDate),
              'days',
              '[]',
            )
          ) {
            throw new BadRequestException({
              message: 'Start date must be within the booking period',
              error: 'BadRequest',
            });
          }

          if (
            service.startDate &&
            service.endDate &&
            moment(service.startDate).isAfter(moment(service.endDate))
          ) {
            throw new BadRequestException({
              message: 'Start date must be before or same end date',
              error: 'BadRequest',
            });
          }
        }

        // Lưu thông tin dịch vụ đặt
        const bookingServiceEntities: BookingServiceEntity[] = [];
        for (const service of body.services) {
          const serviceInfo = await queryRunner.manager.findOne(Service, {
            where: {
              id: service.serviceId,
            },
          });
          bookingServiceEntities.push(
            this.bookingServiceRepository.create({
              ...service,
              bookingId: booking.id,
              price: serviceInfo.price,
              status: role === Role.ADMIN ? 'confirmed' : 'pending',
            }),
          );
        }
        const newBookingServices = await queryRunner.manager.save(
          bookingServiceEntities,
        );

        await queryRunner.commitTransaction();
        return newBookingServices;
      }
      throw new BadRequestException(
        'Cannot book services without a room booking',
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async changeRoom(changeRoomBody: ChangeRoomReqDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Kiểm tra thông tin đặt phòng
      const booking = await queryRunner.manager.findOne(Booking, {
        where: {
          id: changeRoomBody.bookingId,
        },
        relations: ['room', 'roomChangeHistories'],
      });
      if (!booking) {
        throw new BadRequestException({
          message: 'Invalid booking ID',
          error: 'BadRequest',
        });
      }

      // Kiểm tra phòng mới có hợp lệ không
      const toRoom = await queryRunner.manager.findOne(Room, {
        where: {
          id: changeRoomBody.toRoomId,
        },
      });
      if (!toRoom) {
        throw new BadRequestException({
          message: 'Invalid room ID',
          error: 'BadRequest',
        });
      }

      // Kiểm tra phòng mới có giống loại phòng với phòng cũ không
      if (booking.room.typeId !== toRoom.typeId) {
        throw new ConflictException(
          'The new room must be of the same type as the old room',
        );
      }

      // Kiểm tra thời gian ngày chuyển phòng có nằm trong khoảng thời gian hợp đồng có hiệu lực hay không
      if (
        !moment(changeRoomBody.changeDate).isBetween(
          moment(booking.startDate),
          moment(booking.endDate),
          'days',
          '[]',
        )
      ) {
        throw new ConflictException(
          'The room change period must fall within the valid contract period',
        );
      }

      // Kiểm tra phòng mới có sẵn sàng để đặt không
      if (toRoom.status != 'active') {
        throw new ConflictException(
          'This room is currently not available for booking',
        );
      }

      // Kiểm tra phòng mới trong khoảng thời gian từ start date đến end date có ai đặt chưa
      const existingBooking = await queryRunner.manager
        .createQueryBuilder(Booking, 'booking')
        .where('booking.room_id = :roomId', {
          roomId: toRoom.id,
        })
        .andWhere(
          `booking.status != 'rejected' AND booking.start_date < :endDate AND booking.end_date > :startDate`,
          {
            startDate: changeRoomBody.changeDate,
            endDate: booking.endDate,
          },
        )
        .getOne();
      if (existingBooking) {
        throw new ConflictException(
          'This room has already been booked during this time period',
        );
      }

      // Ghi lại thông tin thay đổi phòng
      const roomChangeHistoryEntity = queryRunner.manager.create(
        RoomChangeHistory,
        {
          bookingId: booking.id,
          fromRoomId:
            booking.roomChangeHistories.length > 0
              ? booking.roomChangeHistories.sort((item1, item2) =>
                  moment(item2.changeDate).diff(
                    moment(item1.changeDate),
                    'days',
                  ),
                )[0].toRoomId
              : booking.roomId,
          toRoomId: toRoom.id,
          changeDate: changeRoomBody.changeDate,
          reason: changeRoomBody.reason,
        },
      );
      const newRoomChangeHistory = await queryRunner.manager.save(
        roomChangeHistoryEntity,
      );

      await queryRunner.commitTransaction();
      return newRoomChangeHistory;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async undoContract(bookingId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const booking = await queryRunner.manager.findOne(Booking, {
        where: {
          id: bookingId,
        },
        relations: ['contract'],
      });
      if (!booking) {
        throw new BadRequestException({
          message: 'Invalid booking ID',
          error: 'BadRequest',
        });
      }

      if (!booking.contract) {
        throw new NotFoundException('The contract not found');
      }

      if (booking.status === 'confirmed') {
        throw new ConflictException(
          'Cannot undo contract for a confirmed booking',
        );
      }

      // Cập nhật trạng thái đặt phòng và hợp đồng
      await queryRunner.manager.update(
        Booking,
        {
          id: bookingId,
        },
        {
          status: 'pending',
        },
      );

      // Xoá hợp đồng cũ
      await queryRunner.manager.delete(Contract, {
        bookingId,
      });

      // Xoá file hợp đồng
      const contractFilePath = path.join(
        process.cwd(),
        booking.contract.contractUrl,
      );
      try {
        await fs.unlink(contractFilePath);
      } catch (error) {
        console.error('Error deleting contract file:', error);
      }

      await queryRunner.commitTransaction();
      return null;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmServiceBooking(bookingServiceId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Kiểm tra booking service hợp lệ hay không
      const bookingService = await queryRunner.manager.findOne(
        BookingServiceEntity,
        {
          where: {
            id: bookingServiceId,
          },
          relations: ['booking'],
        },
      );
      if (!bookingService) {
        throw new BadRequestException({
          message: 'Invalid booking service ID',
          error: 'BadRequest',
        });
      }

      // Kiểm tra trạng thái booking service
      if (bookingService.status !== 'pending') {
        throw new ConflictException(
          'Cannot confirm a booking service that is not pending',
        );
      }

      // Cập nhật trạng thái booking service
      const now = moment();
      await queryRunner.manager.update(
        BookingServiceEntity,
        {
          id: bookingServiceId,
        },
        {
          status: 'confirmed',
          startDate: now.isBetween(
            moment(bookingService.startDate),
            moment(bookingService.endDate),
            'days',
            '[]',
          )
            ? now.format('YYYY-MM-DD')
            : bookingService.startDate,
        },
      );

      // Cập nhật lại bảng dịch vụ trong hợp đồng
      const newestBookingInfo = await queryRunner.manager.findOne(Booking, {
        where: {
          id: bookingService.bookingId,
        },
        relations: [
          'contract',
          'room',
          'user',
          'room.type',
          'bookingServices',
          'bookingServices.service',
          'roomChangeHistories',
          'roomChangeHistories.fromRoom',
          'roomChangeHistories.toRoom',
        ],
      });
      const newestbookedServices = newestBookingInfo.bookingServices.map(
        (item, index) => ({
          ...item,
          index: index + 1,
          startDate: moment(item.startDate).format('DD-MM-YYYY'),
          endDate: moment(item.endDate).format('DD-MM-YYYY'),
          totalPrice: String(
            Math.ceil(
              moment(item.endDate).diff(moment(item.startDate), 'days') *
                Number(item.price) *
                item.quantity *
                100,
            ) / 100,
          ),
        }),
      );
      const roomChangeHistories = newestBookingInfo.roomChangeHistories
        .sort((item1, item2) =>
          moment(item1.changeDate).diff(moment(item2.changeDate), 'days'),
        )
        .map((item, index, arr) => ({
          ...item,
          index: index + 1,
          changeDate: moment(item.changeDate).format('DD-MM-YYYY'),
          periodOfTime:
            index < arr.length - 1
              ? `Từ ${moment(item.changeDate).format('DD-MM-YYYY')} đến hết ${moment(arr[index + 1].changeDate).format('DD-MM-YYYY')}`
              : `Từ ${moment(item.changeDate).format('DD-MM-YYYY')} đến ${moment(bookingService.booking.endDate).format('DD-MM-YYYY')}`,
        }));
      const contractHTML = await ejs.renderFile(
        path.join(process.cwd(), 'src/assets/templates/contract.ejs'),
        {
          now: {
            day: moment(newestBookingInfo.contract.createdAt).format('DD'),
            month: moment(newestBookingInfo.contract.createdAt).format('MM'),
            year: moment(newestBookingInfo.contract.createdAt).format('YYYY'),
          },
          booking: {
            ...newestBookingInfo,
            startDate: {
              day: moment(newestBookingInfo.startDate).format('DD'),
              month: moment(newestBookingInfo.startDate).format('MM'),
              year: moment(newestBookingInfo.startDate).format('YYYY'),
            },
            endDate: {
              day: moment(newestBookingInfo.endDate).format('DD'),
              month: moment(newestBookingInfo.endDate).format('MM'),
              year: moment(newestBookingInfo.endDate).format('YYYY'),
            },
          },
          user: {
            ...newestBookingInfo.user,
            dob: {
              day: moment(newestBookingInfo.user.dob).format('DD'),
              month: moment(newestBookingInfo.user.dob).format('MM'),
              year: moment(newestBookingInfo.user.dob).format('YYYY'),
            },
            identityIssuedAt: {
              day: moment(newestBookingInfo.user.identityIssuedAt).format('DD'),
              month: moment(newestBookingInfo.user.identityIssuedAt).format(
                'MM',
              ),
              year: moment(newestBookingInfo.user.identityIssuedAt).format(
                'YYYY',
              ),
            },
          },
          bookedServices: newestbookedServices,
          roomChangeHistories,
          totalBookedServicePrice: String(
            Math.ceil(
              newestbookedServices.reduce(
                (acc, curr) => acc + Number(curr.totalPrice),
                0,
              ) * 100,
            ) / 100,
          ),
          adminSignature: newestBookingInfo.contract.signedByAdmin,
          userSignature: newestBookingInfo.contract.signedByUser,
        },
        {
          async: true,
        },
      );
      const fileName = `${newestBookingInfo.id}_${toPascalCase(newestBookingInfo.user.name)}_Contract`;
      const fileRelativePath = path.join('uploads', `${fileName}.html`);
      await fs.writeFile(
        path.join(process.cwd(), fileRelativePath),
        contractHTML,
      );
      await htmlToPdf(
        path.join(process.cwd(), fileRelativePath),
        path.join(process.cwd(), path.join('uploads', `${fileName}.pdf`)),
      );
      await fs.unlink(path.join(process.cwd(), fileRelativePath));

      await queryRunner.commitTransaction();
      return null;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectServiceBooking(bookingServiceId: number, reason: string) {
    // Kiểm tra booking service hợp lệ hay không
    const bookingService = await this.bookingServiceRepository.findOne({
      where: {
        id: bookingServiceId,
      },
      relations: ['booking'],
    });
    if (!bookingService) {
      throw new BadRequestException({
        message: 'Invalid booking service ID',
        error: 'BadRequest',
      });
    }

    // Cập nhật trạng thái booking service
    return this.bookingServiceRepository.update(
      {
        id: bookingServiceId,
      },
      {
        status: 'rejected',
        reasonForRejection: reason,
      },
    );
  }

  async updateServiceBooking(
    userId: number,
    bookingServiceId: number,
    body: UpdateServiceBookingReqDto,
  ) {
    // Kiểm tra booking service hợp lệ hay không
    const bookingService = await this.bookingServiceRepository.findOne({
      where: {
        id: bookingServiceId,
      },
      relations: ['booking'],
    });
    if (!bookingService) {
      throw new BadRequestException({
        message: 'Invalid booking service ID',
        error: 'BadRequest',
      });
    }

    // Kiểm tra người dùng có quyền cập nhật dịch vụ booking hay không
    if (bookingService.booking.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to update this service booking',
      );
    }

    // Kiển tra startDate và endDate có hợp lệ không
    if (
      body.startDate &&
      !moment(body.startDate).isBetween(
        moment(bookingService.booking.startDate),
        moment(bookingService.booking.endDate),
        'days',
        '[]',
      )
    ) {
      throw new BadRequestException({
        message: 'Start date must be within the booking period',
        error: 'BadRequest',
      });
    }

    if (
      body.endDate &&
      !moment(body.endDate).isBetween(
        moment(bookingService.booking.startDate),
        moment(bookingService.booking.endDate),
        'days',
        '[]',
      )
    ) {
      throw new BadRequestException({
        message: 'Start date must be within the booking period',
        error: 'BadRequest',
      });
    }

    if (
      body.startDate &&
      body.endDate &&
      moment(body.startDate).isAfter(moment(body.endDate))
    ) {
      throw new BadRequestException({
        message: 'Start date must be before or same end date',
        error: 'BadRequest',
      });
    }

    // Kiểm tra dịch vụ có thẻ được cập nhật hay không
    if (bookingService.status !== 'pending') {
      throw new BadRequestException({
        message: 'This service booking cannot be updated',
        error: 'BadRequest',
      });
    }

    // Cập nhật thông tin dịch vụ booking
    return this.bookingServiceRepository.update(
      {
        id: bookingServiceId,
      },
      {
        startDate: body.startDate
          ? moment(body.startDate).format('YYYY-MM-DD')
          : bookingService.startDate,
        endDate: body.endDate
          ? moment(body.endDate).format('YYYY-MM-DD')
          : bookingService.endDate,
        quantity: body.quantity ? body.quantity : bookingService.quantity,
      },
    );
  }

  async cancelServiceBooking(userId: number, bookingServiceId: number) {
    // Kiểm tra booking service hợp lệ hay không
    const bookingService = await this.bookingServiceRepository.findOne({
      where: {
        id: bookingServiceId,
      },
      relations: ['booking'],
    });
    if (!bookingService) {
      throw new BadRequestException({
        message: 'Invalid booking service ID',
        error: 'BadRequest',
      });
    }

    // Kiểm tra người dùng có quyền huỷ dịch vụ booking hay không
    if (bookingService.booking.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to cancel this service booking',
      );
    }

    // Cập nhật trạng thái booking service
    return this.bookingServiceRepository.update(
      {
        id: bookingServiceId,
      },
      {
        status: 'cancelled',
      },
    );
  }
}
