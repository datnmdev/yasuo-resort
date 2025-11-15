import { Module } from '@nestjs/common';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { UserVoucher } from './entities/user-voucher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher, UserVoucher])],
  controllers: [VoucherController],
  providers: [VoucherService],
})
export class VoucherModule {}
