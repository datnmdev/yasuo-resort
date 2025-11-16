import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Combo } from './entities/combo.entity';
import { ComboController } from './combo.controller';
import { ComboService } from './combo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Combo, ComboService])],
  controllers: [ComboController],
  providers: [ComboService],
  exports: [],
})
export class ComboModule {}
