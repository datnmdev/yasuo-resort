import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { Roles } from "common/decorators/roles.decorator";
import { Role } from "common/constants/user.constants";
import { RolesGuard } from "common/guards/roles.guard";
import { BookingRoomReqDto } from "./dtos/booking-room.dto";
import { AppResponse } from "common/http/wrapper.http";
import { User } from "common/decorators/user.decorator";

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService
  ) {}

  @Post()
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  async bookingRoom(
    @User('id') userId: number,
    @Body() bookingRoomBody: BookingRoomReqDto
  ) {
    return AppResponse.ok(await this.bookingService.bookingRoom(userId, bookingRoomBody))
  }
}