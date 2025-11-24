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

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('pay')
  @Roles(Role.CUSTOMER)
  @UseGuards(RolesGuard)
  async payDeposit(
    @Req() req: Request,
    @Body() body: PayDepositReqDto,
    @Res() res: Response,
  ) {
    return res.redirect(await this.paymentService.pay(req, body));
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
