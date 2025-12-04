import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Roles } from 'common/decorators/roles.decorator';
import { Role } from 'common/constants/user.constants';
import { RolesGuard } from 'common/guards/roles.guard';
import { PayDepositReqDto } from './dtos/pay.dto';
import { Request, Response } from 'express';
import { User } from 'common/decorators/user.decorator';
import { GetReceiptsReqDto } from './dtos/get-receipts.dto';
import { AppResponse } from 'common/http/wrapper.http';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('receipts')
  @Roles(Role.CUSTOMER)
  @UseGuards(RolesGuard)
  async getReceipt(
    @Query() query: GetReceiptsReqDto,
    @User('id') userId: number,
  ) {
    return AppResponse.ok(
      await this.paymentService.getReceipts(userId, query.bookingId),
    );
  }

  @Post('pay')
  @Roles(Role.CUSTOMER)
  @UseGuards(RolesGuard)
  async pay(@Req() req: Request, @Body() body: PayDepositReqDto) {
    return AppResponse.ok(await this.paymentService.pay(req, body));
  }

  @Get('vnpay-ipn')
  handleVnpayIpn(@Query() query: any, @Res() res: Response) {
    return res.status(200).json(this.paymentService.handleVnpIpn(query));
  }

  @Get('vnpay-return')
  handleVnpayReturn(@Query() query: any) {
    return this.paymentService.handleVnpReturn(query);
  }
}
