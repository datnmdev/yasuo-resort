import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Roles } from 'common/decorators/roles.decorator';
import { Role } from 'common/constants/user.constants';
import { RolesGuard } from 'common/guards/roles.guard';
import { GetRevenueStatisticsReqDto } from './dtos/get-revenue-statistics.dto';
import { AppResponse } from 'common/http/wrapper.http';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('revenue')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getRevenueStatistics(@Query() query: GetRevenueStatisticsReqDto) {
    return AppResponse.ok(
      await this.statisticsService.getRevenueStatistics(query),
    );
  }
}
