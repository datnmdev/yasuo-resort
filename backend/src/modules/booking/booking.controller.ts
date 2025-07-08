import {
  Body,
  Controller,
  Delete,
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
import { DeleteServiceReqDto } from './dtos/delete-service.dto';
import { SignContractReqDto } from './dtos/sign-contract.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

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
  @Roles(Role.USER)
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
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  async bookingServices(
    @User('id') userId: number,
    @Body() bookingServicesBody: BookingServicesReqDto,
  ) {
    return AppResponse.ok(
      await this.bookingService.bookingServices(userId, bookingServicesBody),
    );
  }

  @Delete('service')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async deleteService(@Query() deleteServicesQuery: DeleteServiceReqDto) {
    return AppResponse.ok(
      await this.bookingService.deleteService(
        deleteServicesQuery.bookingId,
        deleteServicesQuery.serviceId,
      ),
    );
  }
}
