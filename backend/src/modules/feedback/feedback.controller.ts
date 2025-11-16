import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Roles } from 'common/decorators/roles.decorator';
import { Role } from 'common/constants/user.constants';
import { RolesGuard } from 'common/guards/roles.guard';
import { User } from 'common/decorators/user.decorator';
import { CreateFeedbackReqDto } from './dtos/create-feedback.dto';
import { AppResponse } from 'common/http/wrapper.http';
import { GetFeedbackReqDto } from './dtos/get-feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  async getFeedback(
    @Query() query: GetFeedbackReqDto,
  ) {
    return AppResponse.ok(
      await this.feedbackService.getFeedback(query),
    );
  }

  @Post()
  @Roles(Role.CUSTOMER)
  @UseGuards(RolesGuard)
  async createFeedback(
    @User('id') userId: number,
    @Body() createFeedbackBody: CreateFeedbackReqDto,
  ) {
    return AppResponse.ok(
      await this.feedbackService.createFeedback(userId, createFeedbackBody),
    );
  }
}
