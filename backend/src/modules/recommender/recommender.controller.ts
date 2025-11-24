import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RecommenderService } from './recommender.service';
import { Roles } from 'common/decorators/roles.decorator';
import { Role } from 'common/constants/user.constants';
import { RolesGuard } from 'common/guards/roles.guard';
import { User } from 'common/decorators/user.decorator';
import { AppResponse } from 'common/http/wrapper.http';
import { RecommendRoomReqDto } from './dtos/recommend-room.dto';
import { RecommendServiceReqDto } from './dtos/recommend-service.dto';

@Controller('recommender')
export class RecommenderController {
  constructor(private readonly recommenderService: RecommenderService) {}

  @Get('room')
  @Roles(Role.CUSTOMER)
  @UseGuards(RolesGuard)
  async recommendRoom(
    @Query() query: RecommendRoomReqDto,
    @User('id') userId: number,
  ) {
    return AppResponse.ok(
      await this.recommenderService.recommendRoom(userId, query),
    );
  }

  @Get('service')
  @Roles(Role.CUSTOMER)
  @UseGuards(RolesGuard)
  async recommendService(
    @Query() query: RecommendServiceReqDto,
    @User('id') userId: number,
  ) {
    return AppResponse.ok(
      await this.recommenderService.recommendService(userId, query),
    );
  }
}
