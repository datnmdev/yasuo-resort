import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Feedback } from "./entities/feedback.entity";
import { DataSource, Repository } from "typeorm";
import { CreateFeedbackReqDto } from "./dtos/create-feedback.dto";
import { Booking } from "modules/booking/entities/booking.entity";
import { GetFeedbackReqDto } from "./dtos/get-feedback.dto";
import * as _ from 'lodash';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    private readonly dataSource: DataSource,
  ) {}

  async getFeedback(query: GetFeedbackReqDto) {
    const result = await this.feedbackRepository.findAndCount({
      where: {
        targetType: query.targetType,
      },
      relations: [
        'user',
      ],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: {
        createdAt: query.sortOrder,
      },
    });
    return [
      result[0].map(feedback => ({
        ..._.omit(feedback, ['bookingId']),
        user: _.pick(feedback.user, ['id', 'name', 'avatar']),
      }) ),
      result[1],
    ];
  }
  
  async createFeedback(userId: number, body: CreateFeedbackReqDto) {
    const booking = await this.dataSource.manager.findOne(Booking, {
      where: {
        userId,
        id: body.bookingId,
      },
      relations: [
        'bookingServices'
      ]
    })
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    switch (body.targetType) {
      case 'room':
        if (booking.roomId !== body.targetId) {
          throw new NotFoundException('The booked room does not match the feedback target');
        }
        break;
      
      case 'service':
        if (!booking.bookingServices.some(bs => bs.serviceId === body.targetId)) {
          throw new NotFoundException('The booked services do not include the feedback target');
        }
        break;

      default:
        if (booking.comboId !== body.targetId) {
          throw new NotFoundException('The booked combo does not match the feedback target');
        }
        break;
    }

    const feedback = await this.feedbackRepository.findOne({
      where: {
        bookingId: body.bookingId,
        targetType: body.targetType,
        targetId: body.targetId,
      }
    })
    if (feedback) {
      throw new ConflictException('Feedback for this target already exists');
    }

    const newFeedback = this.feedbackRepository.create({
      bookingId: body.bookingId,
      userId,
      rating: body.rating,
      comment: body.comment,
      targetType: body.targetType,
      targetId: body.targetId,
    });
    return this.feedbackRepository.save(newFeedback);
  }
}