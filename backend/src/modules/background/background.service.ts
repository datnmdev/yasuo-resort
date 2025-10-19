import { Injectable, OnModuleInit } from '@nestjs/common';
import { BookingService } from 'modules/booking/entities/booking-service.entity';
import { Booking } from 'modules/booking/entities/booking.entity';
import { UserTier } from 'modules/user/entities/user-tier.entity';
import { User } from 'modules/user/entities/user.entity';
import * as moment from 'moment';
import { DataSource } from 'typeorm';

@Injectable()
export class BackgroundService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  onModuleInit() {
    this.moderationDispatch();
    this.autoUpgradeCustomerTier();
  }

  private async moderationDispatch() {
    setInterval(
      async () => {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
          const bookings = await queryRunner.manager.find(Booking, {
            where: {
              status: 'pending',
            },
            relations: ['contract', 'bookingServices'],
          });

          // Huỷ các yêu cầu đặt phòng chưa được xác nhận bởi admin (thời gian xác nhận vượt quá start date)
          const bookingsWithoutContract = bookings.filter(
            (booking) => !booking.contract,
          );
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
          const bookingsWithUnsignContract = bookings.filter(
            (booking) => booking.contract && !booking.contract.signedByUser,
          );
          for (const booking of bookingsWithUnsignContract) {
            if (
              moment().diff(moment(booking.contract.createdAt), 'hours') >= 24
            ) {
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
          const bookingServices = await queryRunner.manager.find(
            BookingService,
            {
              where: {
                status: 'pending',
              },
            },
          );
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
          console.log(
            'Error in background service moderation dispatch:',
            error,
          );
        } finally {
          await queryRunner.release();
        }
      },
      15 * 60 * 1000,
    );
  }

  private async autoUpgradeCustomerTier() {
    setInterval(async () => {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const user = await queryRunner.manager.find(User, {
          where: {
            role: 'customer',
          },
          relations: ['bookings', 'bookings.payments'],
        });
        const tiers = await queryRunner.manager.find(UserTier, {
          order: {
            tierOrder: 'DESC',
          },
        });
        for (const u of user) {
          for (const tier of tiers) {
            const filteredBookings = u.bookings.filter(
              (b) =>
                moment().diff(moment(b.createdAt), 'months') <=
                tier.durationMonths,
            );
            const totalSpent = filteredBookings.reduce((sum, booking) => {
              const bookingPayments = booking.payments || [];
              const bookingTotal = bookingPayments.reduce(
                (paymentSum, payment) => paymentSum + Number(payment.amount),
                0,
              );
              return sum + bookingTotal;
            }, 0);
            if (
              totalSpent >= Number(tier.minSpending) &&
              filteredBookings.length >= tier.minBookings
            ) {
              u.userTier = tier;
              await queryRunner.manager.save(u);
              break;
            }
          }
        }
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
    }, 24 * 60 * 60 * 1000);
  }
}
