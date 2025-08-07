import { Module } from '@nestjs/common';
import { BackgroundService } from './background.service';

@Module({
  providers: [BackgroundService],
})
export class BackgroundModule {}
