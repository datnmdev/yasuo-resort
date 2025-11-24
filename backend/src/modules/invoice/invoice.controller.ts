import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Roles } from 'common/decorators/roles.decorator';
import { Role } from 'common/constants/user.constants';
import { RolesGuard } from 'common/guards/roles.guard';
import { User } from 'common/decorators/user.decorator';
import { AppResponse } from 'common/http/wrapper.http';
import { GetInvoiceReqDto } from './dtos/get-invoice.dto';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @Roles(Role.CUSTOMER)
  @UseGuards(RolesGuard)
  async getInvoice(
    @Query() query: GetInvoiceReqDto,
    @User('id') userId: number,
  ) {
    return AppResponse.ok(
      await this.invoiceService.getInvoice(userId, query.bookingId),
    );
  }
}
