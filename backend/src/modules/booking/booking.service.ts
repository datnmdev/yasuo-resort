import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
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
            qb.where('bookingId.user_id = :userId', {
              userId: query.userId,
            });
          }
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          if (typeof query.roomId === 'number') {
            qb.where('bookingId.room_id = :roomId', {
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const roomInfo = await this.dataSource.manager.findOne(Room, {
        where: {
          id: bookingRoomBody.roomId,
        },
        relations: ['type'],
      });

      // Kiểm tra phòng này có sẵn sàng để đặt không
      if (roomInfo.status != 'active') {
        throw new ConflictException(
          'This room is currently not available for booking',
        );
      }

      // Kiểm tra phòng này đã được ai đặt chưa và phòng có sẵn
      if (roomInfo.currentCondition === 'booked') {
        throw new ConflictException('Room has already been booked');
      }

      const services: Record<string, Service> = {};
      let totalPrice: number = Number(roomInfo.type.pricePerDay);
      for (const service of bookingRoomBody.services) {
        const serviceInfo = await this.dataSource.manager.findOne(Service, {
          where: {
            id: service.serviceId,
          },
        });
        services[serviceInfo.id] = serviceInfo;
        totalPrice += Number(serviceInfo.price) * service.quantity;
      }

      // Lưu thông tin đặt phòng
      const bookingEntity = this.bookingRepository.create({
        ...bookingRoomBody,
        roomPrice: roomInfo.type.pricePerDay,
        startDate: moment(bookingRoomBody.startDate).format('YYYY-MM-DD'),
        endDate: moment(bookingRoomBody.endDate).format('YYYY-MM-DD'),
        userId,
        totalPrice: totalPrice.toString(),
      });
      const newBooking = await queryRunner.manager.save(bookingEntity);

      // Lưu thông tin dịch vụ kèm theo
      const bookingServiceEntities = bookingRoomBody.services.map((item) =>
        this.bookingServiceRepository.create({
          serviceId: item.serviceId,
          bookingId: newBooking.id,
          quantity: item.quantity,
          price: services[item.serviceId].price,
        }),
      );
      const bookingServices = await queryRunner.manager.save(
        bookingServiceEntities,
      );

      // Cập nhật lại trạng thái phòng
      await queryRunner.manager.update(
        Room,
        {
          id: bookingRoomBody.roomId,
        },
        {
          currentCondition: 'booked',
        },
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
          await queryRunner.manager.update(
            Room,
            {
              id: booking.roomId,
            },
            {
              currentCondition: 'available',
            },
          );
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
        relations: ['room', 'user', 'room.type'],
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
            adminSignature: `data:image/png;base64,${(await fs.readFile(path.join(process.cwd(), 'src/assets/images/director-signature.png'))).toString('base64')}`,
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
          signedByAdmin: 1,
          signedByUser: 0,
          contractUrl: path.join('uploads', `${fileName}.pdf`),
        });
        const newContract = await queryRunner.manager.save(contractEntity);

        await queryRunner.commitTransaction();
        return newContract;
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
        relations: ['contract', 'room', 'user', 'room.type'],
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

      // Kiểm tra hợp đồng đã ký chưa
      if (booking.contract.signedByUser) {
        await fs.unlink(signaturePath);
        throw new ConflictException('The contract has already been signed');
      }

      // Áp dụng chữ ký lên hợp đồng
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
          adminSignature: `data:image/png;base64,${(await fs.readFile(path.join(process.cwd(), 'src/assets/images/director-signature.png'))).toString('base64')}`,
          userSignature: `data:image/png;base64,${(await fs.readFile(signaturePath)).toString('base64')}`,
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
          signedByUser: 1,
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

  async bookingServices(userId: number, body: BookingServicesReqDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const booking = await this.bookingRepository.findOne({
        where: {
          id: body.bookingId,
          userId,
        },
      });
      if (booking) {
        const bookedServices = await this.bookingServiceRepository.find({
          where: {
            bookingId: booking.id,
          },
        });
        const filteredServices = body.services.filter((service) =>
          bookedServices.every(
            (_service) => _service.serviceId != service.serviceId,
          ),
        );
        const bookingServiceEntities: BookingServiceEntity[] = [];
        for (const service of filteredServices) {
          const serviceInfo = await this.dataSource.manager.findOne(Service, {
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
        let totalPrice = Number(booking.roomPrice);
        for (const service of bookedServices) {
          totalPrice += Number(service.price) * service.quantity;
        }
        for (const service of newBookingServices) {
          totalPrice += Number(service.price) * service.quantity;
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

  async deleteService(bookingId: number, serviceId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const deleteResult = await queryRunner.manager.delete(
        BookingServiceEntity,
        {
          bookingId,
          serviceId,
        },
      );

      // Cập nhật lại tổng chi phí thuê phòng + dịch vụ
      const booking = await queryRunner.manager.findOne(Booking, {
        where: {
          id: bookingId,
        },
        relations: ['bookingServices'],
      });
      let totalPrice = Number(booking.roomPrice);
      for (const bookingService of booking.bookingServices) {
        totalPrice += Number(bookingService.price) * bookingService.quantity;
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
      await queryRunner.commitTransaction();
      return deleteResult;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
