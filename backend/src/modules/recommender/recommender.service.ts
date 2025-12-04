import { Injectable } from '@nestjs/common';
import { RoomType } from 'modules/room-type/entities/room-type.entity';
import { Room } from 'modules/room/entities/room.entity';
import { DataSource } from 'typeorm';
import * as tf from '@tensorflow/tfjs';
import { textToVector } from 'common/utils/transform.util';
import { FavoriteRoom } from 'modules/user/entities/favorite-room.entity';
import { Booking } from 'modules/booking/entities/booking.entity';
import * as moment from 'moment';
import { RecommendRoomReqDto } from './dtos/recommend-room.dto';
import { RecommendServiceReqDto } from './dtos/recommend-service.dto';
import { Service } from 'modules/service/entities/service.entity';
import { FavoriteService } from 'modules/user/entities/favorite-service.entity';

@Injectable()
export class RecommenderService {
  constructor(private readonly dataSource: DataSource) {}

  async recommendRoom(userId: number, query: RecommendRoomReqDto) {
    // Tạo vector đặc trưng của từng phòng có trong db
    const embeddings: Array<{ id: number; vector: tf.Tensor<tf.Rank> }> = [];
    const rooms = await this.dataSource.manager.find(Room, {
      order: {
        id: 'ASC',
      },
    });
    if (rooms.length <= 0) {
      return [];
    }
    const roomTypes = await this.dataSource.manager.find(RoomType, {
      order: {
        id: 'ASC',
      },
    });
    const [minPeople, maxPeople] = [
      rooms.reduce(
        (acc, curr) => (curr.maxPeople < acc ? curr.maxPeople : acc),
        rooms[0].maxPeople,
      ),
      rooms.reduce(
        (acc, curr) => (curr.maxPeople > acc ? curr.maxPeople : acc),
        rooms[0].maxPeople,
      ),
    ];
    const [minPrice, maxPrice] = [
      rooms.reduce(
        (acc, curr) => (Number(curr.price) < acc ? Number(curr.price) : acc),
        Number(rooms[0].price),
      ),
      rooms.reduce(
        (acc, curr) => (Number(curr.price) > acc ? Number(curr.price) : acc),
        Number(rooms[0].price),
      ),
    ];
    for (const room of rooms) {
      // Room type encoding
      const roomTypeVector = tf
        .oneHot(
          roomTypes.findIndex((el) => el.id === room.typeId),
          roomTypes.length,
        )
        .toFloat();

      // People normalize
      const peopleNorm = (room.maxPeople - minPeople) / (maxPeople - minPeople);

      // Price normalize
      const priceNorm = (Number(room.price) - minPrice) / (maxPrice - minPrice);

      // Description (Embed sentence)
      const descEmbeddingVector = await textToVector(room.description);
      embeddings.push({
        id: room.id,
        vector: tf.concat([
          roomTypeVector,
          tf.tensor([priceNorm, peopleNorm]),
          tf.tensor(descEmbeddingVector),
        ]),
      });
    }

    // Tìm user vector
    const favoriteRooms = await this.dataSource.manager.find(FavoriteRoom, {
      where: {
        userId,
      },
      relations: ['room'],
    });
    const bookings = await this.dataSource.manager.find(Booking, {
      where: {
        userId,
        status: 'confirmed',
      },
      relations: ['feedbacks'],
    });
    const now = moment();
    const favoriteRoomVW = favoriteRooms
      .map((fr) => ({
        id: fr.roomId,
        w: 0.2,
        dt: now.diff(moment(fr.createdAt), 'days') + 1,
        lamda: 0.05,
      }))
      .reduce(
        (acc: { sum_v: tf.Tensor<tf.Rank>; sum_w: number }, curr) => {
          if (acc.sum_v === null && acc.sum_w === null) {
            return {
              sum_v: embeddings
                .find((e) => e.id === curr.id)
                .vector.mul(curr.w)
                .mul(Math.E ^ (-curr.lamda * curr.dt)),
              sum_w: Math.E ^ (-curr.lamda * curr.dt),
            };
          } else {
            return {
              sum_v: acc.sum_v.add(
                embeddings
                  .find((e) => e.id === curr.id)
                  .vector.mul(curr.w)
                  .mul(Math.E ^ (-curr.lamda * curr.dt)),
              ),
              sum_w: acc.sum_w + (Math.E ^ (-curr.lamda * curr.dt)),
            };
          }
        },
        {
          sum_v: null,
          sum_w: null,
        },
      );
    const bookingsNoFeedbackVW = bookings
      .filter((b) => b.feedbacks.every((fb) => fb.targetType != 'room'))
      .map((b) => ({
        id: b.roomId,
        w: 0.3,
        dt: now.diff(moment(b.createdAt), 'days') + 1,
        lamda: 0.05,
      }))
      .reduce(
        (acc: { sum_v: tf.Tensor<tf.Rank>; sum_w: number }, curr) => {
          if (acc.sum_v === null && acc.sum_w === null) {
            return {
              sum_v: embeddings
                .find((e) => e.id === curr.id)
                .vector.mul(curr.w)
                .mul(Math.E ^ (-curr.lamda * curr.dt)),
              sum_w: Math.E ^ (-curr.lamda * curr.dt),
            };
          } else {
            return {
              sum_v: acc.sum_v.add(
                embeddings
                  .find((e) => e.id === curr.id)
                  .vector.mul(curr.w)
                  .mul(Math.E ^ (-curr.lamda * curr.dt)),
              ),
              sum_w: acc.sum_w + (Math.E ^ (-curr.lamda * curr.dt)),
            };
          }
        },
        {
          sum_v: null,
          sum_w: null,
        },
      );
    const bookingsHaveFeedbackVW = bookings
      .filter((b) => b.feedbacks.some((fb) => fb.targetType === 'room'))
      .map((b) => ({
        id: b.roomId,
        w: 0.5,
        dt1: now.diff(moment(b.createdAt), 'days') + 1,
        dt2:
          now.diff(
            moment(
              b.feedbacks.filter((fb) => fb.targetType === 'room')[0].createdAt,
            ),
            'days',
          ) + 1,
        lamda1: 0.05,
        lamda2: 0.15,
        rating:
          b.feedbacks.filter((fb) => fb.targetType === 'room')[0].rating / 5,
      }))
      .reduce(
        (acc: { sum_v: tf.Tensor<tf.Rank>; sum_w: number }, curr) => {
          if (acc.sum_v === null && acc.sum_w === null) {
            return {
              sum_v: embeddings
                .find((e) => e.id === curr.id)
                .vector.mul(curr.w)
                .mul(Math.E ^ (-curr.lamda1 * curr.dt1))
                .mul(curr.rating)
                .mul(Math.E ^ (-curr.lamda2 * curr.dt2)),
              sum_w:
                (Math.E ^ (-curr.lamda1 * curr.dt1)) *
                curr.rating *
                (Math.E ^ (-curr.lamda2 * curr.dt2)),
            };
          } else {
            return {
              sum_v: acc.sum_v.add(
                embeddings
                  .find((e) => e.id === curr.id)
                  .vector.mul(curr.w)
                  .mul(Math.E ^ (-curr.lamda1 * curr.dt1))
                  .mul(curr.rating)
                  .mul(Math.E ^ (-curr.lamda2 * curr.dt2)),
              ),
              sum_w:
                acc.sum_w +
                (Math.E ^ (-curr.lamda1 * curr.dt1)) *
                  curr.rating *
                  (Math.E ^ (-curr.lamda2 * curr.dt2)),
            };
          }
        },
        {
          sum_v: null,
          sum_w: null,
        },
      );
    const favoriteRoomVector =
      favoriteRoomVW.sum_v === null || favoriteRoomVW.sum_w === null
        ? tf.zeros([embeddings[0].vector.size])
        : favoriteRoomVW.sum_v.div(favoriteRoomVW.sum_w);
    const bookingsNoFeedbackVector =
      bookingsNoFeedbackVW.sum_v === null || bookingsNoFeedbackVW.sum_w === null
        ? tf.zeros([embeddings[0].vector.size])
        : bookingsNoFeedbackVW.sum_v.div(bookingsNoFeedbackVW.sum_w);
    const bookingsHaveFeedbackVector =
      bookingsHaveFeedbackVW.sum_v === null ||
      bookingsHaveFeedbackVW.sum_w === null
        ? tf.zeros([embeddings[0].vector.size])
        : bookingsHaveFeedbackVW.sum_v.div(bookingsHaveFeedbackVW.sum_w);
    let userVector = favoriteRoomVector
      .add(bookingsNoFeedbackVector)
      .add(bookingsHaveFeedbackVector);
    userVector =
      tf.norm(userVector).arraySync() === 0
        ? tf.mean(tf.stack(embeddings.map((e) => e.vector)), 0)
        : userVector;

    // Tính cosine similarity
    const cosineSimilarities = embeddings
      .map((e) => ({
        id: e.id,
        cosSim: tf
          .sum(tf.mul(userVector, e.vector))
          .div(tf.norm(userVector).mul(tf.norm(e.vector)))
          .arraySync() as number,
      }))
      .sort((i1, i2) => i2.cosSim - i1.cosSim);

    const result = await Promise.all(
      cosineSimilarities.map((i) =>
        this.dataSource.manager.findOne(Room, {
          where: {
            id: i.id,
            status: 'active',
          },
          relations: ['media', 'type'],
        }),
      ),
    );

    return [
      result
        .filter(Boolean)
        .slice((query.page - 1) * query.limit, query.page * query.limit),
      result.filter(Boolean).length,
    ];
  }

  async recommendService(userId: number, query: RecommendServiceReqDto) {
    // Tạo vector đặc trưng của từng service có trong db
    const embeddings: Array<{ id: number; vector: tf.Tensor<tf.Rank> }> = [];
    const services = await this.dataSource.manager.find(Service, {
      where: {
        status: 'active',
      },
      order: {
        id: 'ASC',
      },
    });
    if (services.length <= 0) {
      return [];
    }
    const [minPrice, maxPrice] = [
      services.reduce(
        (acc, curr) => (Number(curr.price) < acc ? Number(curr.price) : acc),
        Number(services[0].price),
      ),
      services.reduce(
        (acc, curr) => (Number(curr.price) > acc ? Number(curr.price) : acc),
        Number(services[0].price),
      ),
    ];
    for (const service of services) {
      // Price normalize
      const priceNorm =
        (Number(service.price) - minPrice) / (maxPrice - minPrice);

      // Description (Embed sentence)
      const descEmbeddingVector = await textToVector(service.description);
      embeddings.push({
        id: service.id,
        vector: tf.concat([
          tf.tensor([priceNorm]),
          tf.tensor(descEmbeddingVector),
        ]),
      });
    }

    // Tìm user vector
    const favoriteServices = await this.dataSource.manager.find(
      FavoriteService,
      {
        where: {
          userId,
        },
        relations: ['service'],
      },
    );
    const bookings = await this.dataSource.manager.find(Booking, {
      where: {
        userId,
        status: 'confirmed',
      },
      relations: [
        'feedbacks',
        'bookingServices',
        'bookingServices.booking',
        'bookingServices.booking.feedbacks',
      ],
    });
    const now = moment();
    const favoriteServiceVW = favoriteServices
      .map((fs) => ({
        id: fs.serviceId,
        w: 0.2,
        dt: now.diff(moment(fs.createdAt), 'days') + 1,
        lamda: 0.05,
      }))
      .reduce(
        (acc: { sum_v: tf.Tensor<tf.Rank>; sum_w: number }, curr) => {
          if (acc.sum_v === null && acc.sum_w === null) {
            return {
              sum_v: embeddings
                .find((e) => e.id === curr.id)
                .vector.mul(curr.w)
                .mul(Math.E ^ (-curr.lamda * curr.dt)),
              sum_w: Math.E ^ (-curr.lamda * curr.dt),
            };
          } else {
            return {
              sum_v: acc.sum_v.add(
                embeddings
                  .find((e) => e.id === curr.id)
                  .vector.mul(curr.w)
                  .mul(Math.E ^ (-curr.lamda * curr.dt)),
              ),
              sum_w: acc.sum_w + (Math.E ^ (-curr.lamda * curr.dt)),
            };
          }
        },
        {
          sum_v: null,
          sum_w: null,
        },
      );
    const serviceBookingsNoFeedbackVW = bookings
      .map((b) => b.bookingServices)
      .flat()
      .filter((bs) =>
        bs.booking.feedbacks.every((i) => i.targetType != 'service'),
      )
      .filter(
        (bs) =>
          !bs.booking.feedbacks.some(
            (i) => i.targetType === 'service' && i.targetId === bs.serviceId,
          ),
      )
      .map((bs) => ({
        id: bs.serviceId,
        w: 0.3,
        dt: now.diff(moment(bs.createdAt), 'days') + 1,
        lamda: 0.05,
      }))
      .reduce(
        (acc: { sum_v: tf.Tensor<tf.Rank>; sum_w: number }, curr) => {
          if (acc.sum_v === null && acc.sum_w === null) {
            return {
              sum_v: embeddings
                .find((e) => e.id === curr.id)
                .vector.mul(curr.w)
                .mul(Math.E ^ (-curr.lamda * curr.dt)),
              sum_w: Math.E ^ (-curr.lamda * curr.dt),
            };
          } else {
            return {
              sum_v: acc.sum_v.add(
                embeddings
                  .find((e) => e.id === curr.id)
                  .vector.mul(curr.w)
                  .mul(Math.E ^ (-curr.lamda * curr.dt)),
              ),
              sum_w: acc.sum_w + (Math.E ^ (-curr.lamda * curr.dt)),
            };
          }
        },
        {
          sum_v: null,
          sum_w: null,
        },
      );
    const serviceBookingsHaveFeedbackVW = bookings
      .map((b) => b.bookingServices)
      .flat()
      .filter((bs) =>
        bs.booking.feedbacks.some(
          (i) => i.targetType === 'service' && i.targetId === bs.id,
        ),
      )
      .map((bs) => ({
        id: bs.serviceId,
        w: 0.5,
        dt1: now.diff(moment(bs.createdAt), 'days') + 1,
        dt2:
          now.diff(
            moment(
              bs.booking.feedbacks.filter(
                (fb) =>
                  fb.targetType === 'service' && fb.targetId === bs.serviceId,
              )[0].createdAt,
            ),
            'days',
          ) + 1,
        lamda1: 0.05,
        lamda2: 0.15,
        rating:
          bs.booking.feedbacks.filter(
            (fb) => fb.targetType === 'service' && fb.targetId === bs.serviceId,
          )[0].rating / 5,
      }))
      .reduce(
        (acc: { sum_v: tf.Tensor<tf.Rank>; sum_w: number }, curr) => {
          if (acc.sum_v === null && acc.sum_w === null) {
            return {
              sum_v: embeddings
                .find((e) => e.id === curr.id)
                .vector.mul(curr.w)
                .mul(Math.E ^ (-curr.lamda1 * curr.dt1))
                .mul(curr.rating)
                .mul(Math.E ^ (-curr.lamda2 * curr.dt2)),
              sum_w:
                (Math.E ^ (-curr.lamda1 * curr.dt1)) *
                curr.rating *
                (Math.E ^ (-curr.lamda2 * curr.dt2)),
            };
          } else {
            return {
              sum_v: acc.sum_v.add(
                embeddings
                  .find((e) => e.id === curr.id)
                  .vector.mul(curr.w)
                  .mul(Math.E ^ (-curr.lamda1 * curr.dt1))
                  .mul(curr.rating)
                  .mul(Math.E ^ (-curr.lamda2 * curr.dt2)),
              ),
              sum_w:
                acc.sum_w +
                (Math.E ^ (-curr.lamda1 * curr.dt1)) *
                  curr.rating *
                  (Math.E ^ (-curr.lamda2 * curr.dt2)),
            };
          }
        },
        {
          sum_v: null,
          sum_w: null,
        },
      );
    const favoriteServiceVector =
      favoriteServiceVW.sum_v === null || favoriteServiceVW.sum_w === null
        ? tf.zeros([embeddings[0].vector.size])
        : favoriteServiceVW.sum_v.div(favoriteServiceVW.sum_w);
    const serviceBookingsNoFeedbackVector =
      serviceBookingsNoFeedbackVW.sum_v === null ||
      serviceBookingsNoFeedbackVW.sum_w === null
        ? tf.zeros([embeddings[0].vector.size])
        : serviceBookingsNoFeedbackVW.sum_v.div(
            serviceBookingsNoFeedbackVW.sum_w,
          );
    const serviceBookingsHaveFeedbackVector =
      serviceBookingsHaveFeedbackVW.sum_v === null ||
      serviceBookingsHaveFeedbackVW.sum_w === null
        ? tf.zeros([embeddings[0].vector.size])
        : serviceBookingsHaveFeedbackVW.sum_v.div(
            serviceBookingsHaveFeedbackVW.sum_w,
          );
    let userVector = favoriteServiceVector
      .add(serviceBookingsNoFeedbackVector)
      .add(serviceBookingsHaveFeedbackVector);
    userVector =
      tf.norm(userVector).arraySync() === 0
        ? tf.mean(tf.stack(embeddings.map((e) => e.vector)), 0)
        : userVector;

    // Tính cosine similarity
    const cosineSimilarities = embeddings
      .map((e) => ({
        id: e.id,
        cosSim: tf
          .sum(tf.mul(userVector, e.vector))
          .div(tf.norm(userVector).mul(tf.norm(e.vector)))
          .arraySync() as number,
      }))
      .sort((i1, i2) => i2.cosSim - i1.cosSim);

    const result = await Promise.all(
      cosineSimilarities.map((i) =>
        this.dataSource.manager.findOne(Service, {
          where: {
            id: i.id,
            status: 'active',
          },
        }),
      ),
    );

    return [
      result
        .filter(Boolean)
        .slice((query.page - 1) * query.limit, query.page * query.limit),
      result.filter(Boolean).length,
    ];
  }
}
