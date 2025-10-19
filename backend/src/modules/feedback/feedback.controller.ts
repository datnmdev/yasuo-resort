import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Roles } from 'common/decorators/roles.decorator';
import { Role } from 'common/constants/user.constants';
import { RolesGuard } from 'common/guards/roles.guard';
import { User } from 'common/decorators/user.decorator';
import { CreateFeedbackReqDto } from './dtos/create-feedback.dto';
import { AppResponse } from 'common/http/wrapper.http';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

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
