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
import { VoucherService } from './voucher.service';
import { Roles } from 'common/decorators/roles.decorator';
import { Role } from 'common/constants/user.constants';
import { RolesGuard } from 'common/guards/roles.guard';
import { AppResponse } from 'common/http/wrapper.http';
import { CreateVoucherReqDto } from './dtos/create-voucher.dto';
import { UpdateVoucherReqDto } from './dtos/update-voucher.dto';
import { GetVoucherReqDto } from './dtos/get-voucher.dto';
import { User } from 'common/decorators/user.decorator';
import { ClaimVoucherReqDto } from './dtos/claim-voucher.dto';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Get()
  @Roles(Role.CUSTOMER, Role.ADMIN)
  @UseGuards(RolesGuard)
  async getVouchers(
    @User('id') userId: number,
    @Query() query: GetVoucherReqDto,
  ) {
    return AppResponse.ok(
      await this.voucherService.getVouchers(userId, query),
    );
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async createVoucher(@Body() createVoucherBody: CreateVoucherReqDto) {
    return AppResponse.ok(
      await this.voucherService.createVoucher(createVoucherBody),
    );
  }

  @Post('claim')
  @Roles(Role.CUSTOMER)
  @UseGuards(RolesGuard)
  async claimVoucher(
    @User('id') userId: number,
    @Body() claimVoucherBody: ClaimVoucherReqDto
  ) {
    return AppResponse.ok(
      await this.voucherService.claimVoucher(userId, claimVoucherBody.id),
    );
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateVoucher(
    @Param('id') id: number,
    @Body() updateVoucherBody: UpdateVoucherReqDto,
  ) {
    return AppResponse.ok(
      await this.voucherService.updateVoucher(id, updateVoucherBody),
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async deleteVoucher(@Param('id') id: number) {
    return AppResponse.ok(await this.voucherService.deleteVoucher(id));
  }
}
