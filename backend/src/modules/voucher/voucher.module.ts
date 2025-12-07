import { Module } from '@nestjs/common';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { UserVoucher } from './entities/user-voucher.entity';
import { MailModule } from 'common/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher, UserVoucher]), MailModule],
  controllers: [VoucherController],
  providers: [VoucherService],
})
export class VoucherModule {}
