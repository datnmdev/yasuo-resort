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
import { ChangeRoomReqDto } from './dtos/change-room.dto';
import { RejectBookingReqDto } from './dtos/reject-booking.dto';
import { RejectServiceBookingReqDto } from './dtos/reject-service-booking.dto';
import { UpdateServiceBookingReqDto } from './dtos/update-service-booking.dto';

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
  @Roles(Role.CUSTOMER)
  @UseGuards(RolesGuard)
  async bookingRoom(
    @User('id') userId: number,
    @Body() bookingRoomBody: BookingRoomReqDto,
  ) {
    return AppResponse.ok(
      await this.bookingService.bookingRoom(userId, bookingRoomBody),
    );
  }

  @Put(':bookingId/reject-room-booking')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async rejectRoomBooking(
    @Param('bookingId') bookingId: number,
    @Body() rejectBookingBody: RejectBookingReqDto,
  ) {
    return AppResponse.ok(
      await this.bookingService.rejectRoomBooking(bookingId, rejectBookingBody.reason),
    );
  }

  @Put(':bookingId/cancel-room-booking')
  @Roles(Role.CUSTOMER)
  @UseGuards(RolesGuard)
  async cancelRoomBooking(
    @User('id') userId: number,
    @Param('bookingId') bookingId: number,
  ) {
    return AppResponse.ok(
      await this.bookingService.cancelRoomBooking(userId, bookingId),
    );
  }

  @Put(':bookingId/create-contract')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async createContract(@Param('bookingId') bookingId: number) {
    return AppResponse.ok(await this.bookingService.createContract(bookingId));
  }

  @Put(':bookingId/sign-contract')
  @Roles(Role.CUSTOMER)
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

  @Put('change-room')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async changeRoom(
    @Body() changeRoomBody: ChangeRoomReqDto,
  ) {
    return AppResponse.ok(
      await this.bookingService.changeRoom(changeRoomBody),
    );
  }

  @Put(':bookingId/undo-contract')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async undoContract(
    @Param('bookingId') bookingId: number,
  ) {
    return AppResponse.ok(
      await this.bookingService.undoContract(bookingId)
    );
  }

  @Post('service')
  @Roles(Role.CUSTOMER, Role.ADMIN)
  @UseGuards(RolesGuard)
  async bookingServices(
    @User('role') role: Role,
    @User('id') userId: number,
    @Body() bookingServicesBody: BookingServicesReqDto,
  ) {
    return AppResponse.ok(
      await this.bookingService.bookingServices(
        role,
        userId,
        bookingServicesBody,
      ),
    );
  }

  @Put('service/:bookingServiceId/confirm')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async confirmServiceBooking(
    @Param('bookingServiceId') bookingServiceId: number,
  ) {
    return AppResponse.ok(
      await this.bookingService.confirmServiceBooking(bookingServiceId)
    );
  }

  @Put('service/:bookingServiceId/reject')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async rejectServiceBooking(
    @Param('bookingServiceId') bookingServiceId: number,
    @Body() rejectServiceBookingBody: RejectServiceBookingReqDto,
  ) {
    return AppResponse.ok(
      await this.bookingService.rejectServiceBooking(bookingServiceId, rejectServiceBookingBody.reasonForRejection)
    );
  }

  @Put('service/:bookingServiceId')
  @Roles(Role.CUSTOMER)
  @UseGuards(RolesGuard)
  async updateServiceBooking(
    @User('id') userId: number,
    @Param('bookingServiceId') bookingServiceId: number,
    @Body() updateServiceBookingBody: UpdateServiceBookingReqDto,
  ) {
    return AppResponse.ok(
      await this.bookingService.updateServiceBooking(userId, bookingServiceId, updateServiceBookingBody)
    );
  }

  @Put('service/:bookingServiceId/cancel')
  @Roles(Role.CUSTOMER)
  @UseGuards(RolesGuard)
  async cancelServiceBooking(
    @User('id') userId: number,
    @Param('bookingServiceId') bookingServiceId: number,
  ) {
    return AppResponse.ok(
      await this.bookingService.cancelServiceBooking(userId, bookingServiceId)
    );
  }
}
