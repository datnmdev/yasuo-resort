import { Module } from "@nestjs/common";
import { BookingController } from "./booking.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "./entities/booking.entity";
import { Contract } from "./entities/contract.entity";
import { BookingService as BookingServiceEntity } from "./entities/booking-service.entity";
import { BookingService } from "./booking.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingServiceEntity,
      Contract
    ])
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