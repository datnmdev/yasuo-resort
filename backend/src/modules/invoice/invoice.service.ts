import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { DataSource, Repository } from 'typeorm';
import { Booking } from 'modules/booking/entities/booking.entity';
import * as path from 'path';
import { ConfigService } from 'common/config/config.service';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) { }

  async getInvoice(userId: number, bookingId: number) {
    const booking = await this.dataSource.manager.findOne(Booking, {
      where: {
        id: bookingId,
        userId,
      },
      relations: ['invoices'],
    });
    if (!booking) {
      throw new NotFoundException({
        message: 'Booking ID not found',
        error: 'BadRequest',
      });
    }
    return booking.invoices.map((i) =>
      path.join(
        this.configService.getServerConfig().baseUrl,
        'uploads',
        `${i.invoiceNumber}_Invoice.pdf`,
      ),
    );
  }
}
