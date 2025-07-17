import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { Roles } from 'common/decorators/roles.decorator';
import { Role } from 'common/constants/user.constants';
import { RolesGuard } from 'common/guards/roles.guard';
import { BookingRoomReqDto } from './dtos/booking-room.dto';
import { AppResponse } from 'common/http/wrapper.http';
import { User } from 'common/decorators/user.decorator';
import { BookingServicesReqDto } from './dtos/booking-service.dto';
import { SignContractReqDto } from './dtos/sign-contract.dto';
import { GetBookingReqDto } from './dtos/get-bookings.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  async getBookings(@Query() getBookingsQuery: GetBookingReqDto) {
    return AppResponse.ok(
      await this.bookingService.getBookings(getBookingsQuery),
    );
  }

  @Post()
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  async bookingRoom(
    @User('id') userId: number,
    @Body() bookingRoomBody: BookingRoomReqDto,
  ) {
    return AppResponse.ok(
      await this.bookingService.bookingRoom(userId, bookingRoomBody),
    );
  }

  @Put(':bookingId/cancel-room-booking')
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(RolesGuard)
  async cancelRoomBooking(
    @User('id') userId: number,
    @User('role') role: Role,
    @Param('bookingId') bookingId: number,
  ) {
    return AppResponse.ok(
      await this.bookingService.cancelRoomBooking(role, userId, bookingId),
    );
  }

  @Put(':bookingId/create-contract')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async createContract(@Param('bookingId') bookingId: number) {
    return AppResponse.ok(await this.bookingService.createContract(bookingId));
  }

  @Put(':bookingId/sign-contract')
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  async signContract(
    @User('id') userId: number,
    @Param('bookingId') bookingId: number,
    @Body() signContractBody: SignContractReqDto,
  ) {
    return AppResponse.ok(
      await this.bookingService.signContract(
        userId,
        bookingId,
        signContractBody.signatureUrl,
      ),
    );
  }

  @Post('service')
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(RolesGuard)
  async bookingServices(
    @User('role') role: string,
    @User('id') userId: number,
    @Body() bookingServicesBody: BookingServicesReqDto,
  ) {
    if (role === Role.ADMIN) {
      return AppResponse.ok(
        await this.bookingService.bookingServicesWithAdminRole(
          bookingServicesBody,
        ),
      );
    }
    return AppResponse.ok(
      await this.bookingService.bookingServicesWithUserRole(
        userId,
        bookingServicesBody,
      ),
    );
  }
}
