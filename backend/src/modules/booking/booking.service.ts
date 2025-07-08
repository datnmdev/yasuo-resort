import { BadRequestException, ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Booking } from "./entities/booking.entity";
import { DataSource, Repository } from "typeorm";
import { Contract } from "./entities/contract.entity";
import { BookingRoomReqDto } from "./dtos/booking-room.dto";
import * as moment from "moment";
import { Room } from "modules/room/entities/room.entity";
import { Service } from "modules/service/entities/service.entity";
import { BookingService as BookingServiceEntity } from "./entities/booking-service.entity";

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingServiceEntity)
    private readonly bookingServiceRepository: Repository<BookingServiceEntity>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly dataSource: DataSource
  ) {}

  async bookingRoom(userId: number, bookingRoomBody: BookingRoomReqDto) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const roomInfo = await this.dataSource.manager.findOne(Room, {
        where: {
          id: bookingRoomBody.roomId
        },
        relations: [
          'type'
        ]
      })

      // Kiểm tra phòng này đã được ai đặt chưa
      if (roomInfo.currentCondition === 'booked') {
        throw new ConflictException('Room has already been booked');
      }

      let totalPrice: number = Number(roomInfo.type.pricePerDay);
      for (const service of bookingRoomBody.services) {
        const serviceInfo = await this.dataSource.manager.findOne(Service, {
          where: {
            id: service.serviceId
          }
        })
        if (serviceInfo) {
          totalPrice += Number(serviceInfo.price)
        }
      }
  
      // Lưu thông tin đặt phòng
      const bookingEntity = this.bookingRepository.create({
        ...bookingRoomBody,
        startDate: moment(bookingRoomBody.startDate).format("YYYY-MM-DD"),
        endDate: moment(bookingRoomBody.endDate).format("YYYY-MM-DD"),
        userId,
        totalPrice: String(Math.ceil(totalPrice * 100) / 100)
      })
      const newBooking = await queryRunner.manager.save(bookingEntity)
  
      // Lưu thông tin dịch vụ kèm theo
      const bookingServiceEntities = bookingRoomBody.services.map(item => this.bookingServiceRepository.create({
        serviceId: item.serviceId,
        bookingId: newBooking.id,
        quantity: item.quantity
      }))
      const bookingServices = await queryRunner.manager.save(bookingServiceEntities)

      // Cập nhật lại trạng thái phòng
      await queryRunner.manager.update(Room, {
        id: bookingRoomBody.roomId
      }, {
        currentCondition: 'booked'
      })
      await queryRunner.commitTransaction()
      
      return {
        ...newBooking,
        bookingServices
      };
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error;
    } finally {
      await queryRunner.release()
    }
  }

  async cancelRoomBooking(userId: number, bookingId: number) {
    const booking = await this.bookingRepository.findOne({
      where: {
        userId,
        id: bookingId
      }
    })
    if (booking) {
      if (booking.status === 'pending') {
        return await this.bookingRepository.update({
          id: bookingId
        }, {
          status: 'cancelled'
        })
      } else if (booking.status === 'confirmed') {
        throw new ForbiddenException('Cannot cancel a confirmed booking');
      }
      throw new BadRequestException('This booking has already been canceled');
    }
    throw new ForbiddenException('You are not allowed to modify this resource')
  }
}