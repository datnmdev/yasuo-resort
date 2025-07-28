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
import { NotFoundError } from 'rxjs';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingServiceEntity)
    private readonly bookingServiceRepository: Repository<BookingServiceEntity>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly dataSource: DataSource,
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
    // Kiểm tra tính hợp lệ của start date và end date
    if (
      moment(bookingRoomBody.startDate).valueOf() < Date.now() ||
      moment(bookingRoomBody.endDate).valueOf() <= Date.now()
    ) {
      throw new BadRequestException({
        message: 'The contract signing date and end date must be in the future',
        error: 'BadRequest',
      });
    }
    const totalRentalDays = moment(bookingRoomBody.endDate).diff(
      moment(bookingRoomBody.startDate),
      'days',
    );
    if (totalRentalDays <= 0) {
      throw new BadRequestException({
        message: 'The contract end date must be later than the signing date',
        error: 'BadRequest',
      });
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const roomInfo = await queryRunner.manager.findOne(Room, {
        where: {
          id: bookingRoomBody.roomId,
        },
        relations: [
          'type',
          'type.roomTypeAddons',
          'type.roomTypeAddons.service',
        ],
      });

      // Kiểm tra tính hợp lệ của roomId
      if (!roomInfo) {
        throw new BadRequestException({
          message: 'Invalid room ID',
          error: 'BadRequest',
        });
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
          `booking.status != 'cancelled' AND booking.start_date < :endDate AND booking.end_date > :startDate`,
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

      // Lưu thông tin đặt phòng
      const bookingEntity = this.bookingRepository.create({
        ...bookingRoomBody,
        roomPrice: roomInfo.price,
        startDate: moment(bookingRoomBody.startDate).format('YYYY-MM-DD'),
        endDate: moment(bookingRoomBody.endDate).format('YYYY-MM-DD'),
        userId,
        totalPrice: String(
          Math.ceil(Number(roomInfo.price) * totalRentalDays * 100) / 100,
        ),
      });
      const newBooking = await queryRunner.manager.save(bookingEntity);

      // Lưu thông tin dịch vụ kèm theo
      const bookingServiceEntities = roomInfo.type.roomTypeAddons.map((item) =>
        this.bookingServiceRepository.create({
          serviceId: item.serviceId,
          bookingId: newBooking.id,
          quantity: roomInfo.maxPeople,
          price: '0.00',
          startDate: newBooking.startDate,
          endDate: newBooking.endDate,
        }),
      );
      const bookingServices = await queryRunner.manager.save(
        bookingServiceEntities,
      );

      await queryRunner.commitTransaction();

      return {
        ...newBooking,
        bookingServices,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelRoomBooking(role: Role, userId: number, bookingId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let booking = await queryRunner.manager.findOne(Booking, {
        where: {
          userId,
          id: bookingId,
        },
      });
      if (role === Role.ADMIN) {
        booking = await queryRunner.manager.findOne(Booking, {
          where: {
            id: bookingId,
          },
        });
      }
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
          await queryRunner.commitTransaction();
          return result;
        } else if (booking.status === 'confirmed') {
          throw new ForbiddenException('Cannot cancel a confirmed booking');
        }
        throw new BadRequestException('This booking has already been canceled');
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
        ],
      });
      if (booking) {
        if (booking.status === 'cancelled') {
          throw new ConflictException(
            'Cannot create contract for a cancelled booking',
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
      if (booking.status === 'cancelled') {
        await fs.unlink(signaturePath);
        throw new ConflictException(
          'Cannot create contract for a cancelled booking',
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

      // Cập nhật lại trạng thái đặt phòng
      await queryRunner.manager.update(
        Booking,
        {
          id: bookingId,
        },
        {
          status: 'confirmed',
        },
      );
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
        const bookedServices = await queryRunner.manager.find(
          BookingServiceEntity,
          {
            where: {
              bookingId: booking.id,
            },
          },
        );
        const filteredServices = body.services.filter((service) =>
          bookedServices.every(
            (_service) => _service.serviceId != service.serviceId,
          ),
        );
        const bookingServiceEntities: BookingServiceEntity[] = [];
        for (const service of filteredServices) {
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
            }),
          );
        }
        const newBookingServices = await queryRunner.manager.save(
          bookingServiceEntities,
        );
        // Cập nhật lại tổng chi phí thuê phòng + dịch vụ
        let totalPrice =
          Number(booking.roomPrice) *
          moment(booking.endDate).diff(moment(booking.startDate), 'days');
        for (const service of bookedServices) {
          totalPrice +=
            Number(service.price) *
            service.quantity *
            moment(service.endDate).diff(moment(service.startDate), 'days');
        }
        for (const service of newBookingServices) {
          totalPrice +=
            Number(service.price) *
            service.quantity *
            moment(service.endDate).diff(moment(service.startDate), 'days');
        }
        await queryRunner.manager.update(
          Booking,
          {
            id: booking.id,
          },
          {
            totalPrice: totalPrice.toString(),
          },
        );

        // Cập nhật lại bảng dịch vụ trong hợp đồng
        const newestBookingInfo = await queryRunner.manager.findOne(Booking, {
          where: {
            id: booking.id,
          },
          relations: [
            'contract',
            'room',
            'user',
            'room.type',
            'bookingServices',
            'bookingServices.service',
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
                day: moment(newestBookingInfo.user.identityIssuedAt).format(
                  'DD',
                ),
                month: moment(newestBookingInfo.user.identityIssuedAt).format(
                  'MM',
                ),
                year: moment(newestBookingInfo.user.identityIssuedAt).format(
                  'YYYY',
                ),
              },
            },
            bookedServices: newestbookedServices,
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
}
