import { Injectable, OnModuleInit } from '@nestjs/common';
import { BookingService } from 'modules/booking/entities/booking-service.entity';
import { Booking } from 'modules/booking/entities/booking.entity';
import * as moment from 'moment';
import { DataSource } from 'typeorm';

@Injectable()
export class BackgroundService implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit() {
    this.moderationDispatch();
  }

  private moderationDispatch() {
    setInterval(async () => {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const bookings = await queryRunner.manager.find(Booking, {
          where: {
            status: 'pending',
          },
          relations: [
            'contract',
            'bookingServices',
          ]
        });

        // Huỷ các yêu cầu đặt phòng chưa được xác nhận bởi admin (thời gian xác nhận vượt quá start date)
        const bookingsWithoutContract = bookings.filter(booking => !booking.contract)
        for (const booking of bookingsWithoutContract) {
          if (moment().isSameOrAfter(moment(booking.startDate), 'days')) {
            await queryRunner.manager.update(Booking, booking.id, {
              status: 'rejected',
            });
            for (const service of booking.bookingServices) {
              await queryRunner.manager.update(BookingService, service.id, {
                status: 'rejected',
              });
            }
          }
        }

        // Huỷ các yêu cầu đặt phòng đã được xác minh bởi admin nhưng customer chưa ký hợp đồng (quá 24h kể từ khi tạo hợp đồng)
        const bookingsWithUnsignContract = bookings.filter(booking => booking.contract && !booking.contract.signedByUser)
        for (const booking of bookingsWithUnsignContract) {
          if (moment().diff(moment(booking.contract.createdAt), 'hours') >= 24) {
            await queryRunner.manager.update(Booking, booking.id, {
              status: 'rejected',
            });
            for (const service of booking.bookingServices) {
              await queryRunner.manager.update(BookingService, service.id, {
                status: 'rejected',
              });
            }
          }
        }

        // Huỷ các dịch vụ đặt chưa được xác nhận bởi admin (thời gian xác nhận vượt quá end date)
        const bookingServices = await queryRunner.manager.find(BookingService, {
          where: {
            status: 'pending',
          }
        });
        for (const service of bookingServices) {
          if (moment().isSameOrAfter(moment(service.endDate), 'days')) {
            await queryRunner.manager.update(BookingService, service.id, {
              status: 'rejected',
            });
          }
        }

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.log('Error in background service moderation dispatch:', error);
      } finally {
        await queryRunner.release();
      }
    }, 15 * 60 * 1000);
  }
}
