import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Brackets, DataSource, QueryFailedError, Repository } from 'typeorm';
import { CreateRoomReqDto } from './dtos/create-room.dto';
import { UpdateRoomReqDto } from './dtos/update-room.dto';
import { GetRoomsReqDto } from './dtos/get-room.dto';
import * as _ from 'lodash';
import { Media } from './entities/media.entity';
import { access, unlink } from 'fs/promises';
import * as path from 'path';
import * as moment from 'moment';
import { Booking } from 'modules/booking/entities/booking.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly datasource: DataSource,
  ) {}

  getRooms(query: GetRoomsReqDto) {
    return this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.media', 'media')
      .leftJoinAndSelect('room.type', 'type')
      .where(
        new Brackets((qb) => {
          if (query.keyword) {
            qb.where('room.roomNumber = :roomNumber', {
              roomNumber: query.keyword,
            });
            if (!isNaN(Number(query.keyword))) {
              qb.orWhere('room.id = :id', {
                id: Number(query.keyword),
              });
            }
          }
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          if (typeof query.typeId === 'number') {
            qb.where('room.type_id = :typeId', {
              typeId: query.typeId,
            });
          }
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          if (typeof query.maxPeople === 'number') {
            qb.where('room.max_people = :maxPeople', {
              maxPeople: query.maxPeople,
            });
          }
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          if (query.status instanceof Array) {
            query.status.forEach((e, i) => {
              if (i === 0) {
                qb.where(`room.status = :status0`, {
                  status0: e,
                });
              } else {
                qb.orWhere(`room.status = :status${i}`, {
                  [`status${i}`]: e,
                });
              }
            });
          }
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          if (query.priceRange) {
            qb.where('room.price >= :minPrice AND room.price <= :maxPrice', {
              minPrice: query.priceRange.minPrice,
              maxPrice: query.priceRange.maxPrice,
            });
          }
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          if (query.dateRange) {
            qb.andWhere(
              `room.id NOT IN (
              SELECT b.room_id FROM booking b
              WHERE b.status != 'cancelled' AND b.start_date < :endDate AND b.end_date > :startDate
            )`,
              {
                startDate: moment(query.dateRange.startDate).format(
                  'YYYY-MM-DD',
                ),
                endDate: moment(query.dateRange.endDate).format('YYYY-MM-DD'),
              },
            );
          }
        }),
      )
      .orderBy('room.id', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
  }

  async createRoom(body: CreateRoomReqDto) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Kiểm tra room number
      const room = await this.roomRepository.findOne({
        where: {
          roomNumber: body.roomNumber,
        },
        relations: ['type'],
      });
      if (room) {
        throw new ConflictException('Room number already exists');
      }

      // Kiểm tra giá phòng có nằm trong khoảng giá quy định không
      if (
        Number(body.price) < Number(room.type.minPrice) ||
        Number(body.price) > Number(room.type.maxPrice)
      ) {
        throw new ConflictException(
          'The room price is outside the allowed price range for this room type',
        );
      }

      // Tạo room mới
      const roomEntity = queryRunner.manager.create(Room, {
        ..._.omit(body, 'media'),
        status: 'inactive',
      });
      const newRoom = await queryRunner.manager.save(roomEntity);

      // Lưu media
      const mediaEntities = body.media.map((item) =>
        queryRunner.manager.create(Media, {
          roomId: newRoom.id,
          path: item,
        }),
      );
      const newMedia = await queryRunner.manager.save(mediaEntities);
      await queryRunner.commitTransaction();
      return {
        ...newRoom,
        newMedia,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateRoom(roomId: number, body: UpdateRoomReqDto) {
    if (body.status === 'maintenance' && !body.maintenanceStartDate) {
      throw new BadRequestException({
        message:
          'Maintenance start date is required when status is set to maintenance',
        error: 'BadRequest',
      });
    }

    if (body.status != 'maintenance' && body.maintenanceStartDate) {
      throw new BadRequestException({
        message:
          'Maintenance start date should only be set when status is maintenance',
        error: 'BadRequest',
      });
    }

    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (Object.keys(body).length === 0) {
        return null;
      }

      // Kiểm tra room
      const room = await this.roomRepository.findOne({
        where: {
          id: roomId,
        },
      });
      if (room) {
        // Kiểm tra giá phòng có nằm trong khoảng giá quy định không
        if (
          body.price &&
          (Number(body.price) < Number(room.type.minPrice) ||
            Number(body.price) > Number(room.type.maxPrice))
        ) {
          throw new ConflictException(
            'The room price is outside the allowed price range for this room type',
          );
        }

        // Cập nhật thông tin room vào CSDL
        if (Object.keys(_.omit(body, 'media')).length > 0) {
          await queryRunner.manager.update(
            Room,
            {
              id: roomId,
            },
            {
              ..._.omit(body, ['media']),
              maintenanceStartDate: body.maintenanceStartDate
                ? body.maintenanceStartDate
                : null,
            },
          );
        }

        // Cập nhật media
        if (body.media) {
          const oldMedia = await queryRunner.manager.find(Media, {
            where: {
              roomId,
            },
          });
          for (const item of oldMedia) {
            const filePath = path.join(process.cwd(), item.path);
            try {
              await access(filePath);
              await unlink(filePath);
            } catch (error) {
              console.log('Delete File Error::', error);
            }
          }
          await queryRunner.manager.delete(Media, {
            roomId: room.id,
          });
          const mediaEntities = body.media.map((item) =>
            queryRunner.manager.create(Media, {
              roomId: room.id,
              path: item,
            }),
          );
          await queryRunner.manager.save(mediaEntities);
        }
        await queryRunner.commitTransaction();
        return null;
      }
      throw new NotFoundException('Room not found');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteRoom(roomId: number) {
    try {
      const deleteResult = await this.roomRepository.delete({
        id: roomId,
      });
      return deleteResult;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException({
          error: 'DeleteConflict',
          message: 'Cannot delete because the data is being used elsewhere',
        });
      }
      throw error;
    }
  }
}
