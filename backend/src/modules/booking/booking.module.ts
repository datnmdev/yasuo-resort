import { Module } from "@nestjs/common";
import { BookingController } from "./booking.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "./entities/booking.entity";
import { Contract } from "./entities/contract.entity";
import { BookingService as BookingServiceEntity } from "./entities/booking-service.entity";
import { BookingService } from "./booking.service";
import { MailModule } from "common/mail/mail.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingServiceEntity,
      Contract,
    ]),
    MailModule
  ],
  controllers: [
    BookingController
  ],
  providers: [
    BookingService
  ],
  exports: []
})
export class BookingModule {}