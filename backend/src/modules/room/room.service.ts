import {
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
      .where(
        new Brackets((qb) => {
          if (typeof query.roomNumber === 'string') {
            qb.where('room.roomNumber = :roomNumber', {
              roomNumber: query.roomNumber,
            });
          }
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          if (typeof query.typeId === 'number') {
            qb.where('room.typeId = :typeId', {
              typeId: query.typeId,
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
          if (query.currentCondition instanceof Array) {
            query.currentCondition.forEach((e, i) => {
              if (i === 0) {
                qb.where(`room.current_condition = :currentCondition0`, {
                  currentCondition0: e,
                });
              } else {
                qb.orWhere(`room.current_condition = :currentCondition${i}`, {
                  [`currentCondition${i}`]: e,
                });
              }
            });
          }
        }),
      )
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
      });
      if (room) {
        throw new ConflictException('Room number already exists');
      }

      // Tạo room mới
      const roomEntity = queryRunner.manager.create(
        Room,
        _.omit(body, 'media'),
      );
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
        const isValidRoomNumber =
          body.roomNumber &&
          (await this.roomRepository.findOne({
            where: {
              roomNumber: body.roomNumber,
            },
          }))
            ? true
            : false;
        if (!isValidRoomNumber) {
          // Cập nhật thông tin room vào CSDL
          if (Object.keys(_.omit(body, 'media')).length > 0) {
            await queryRunner.manager.update(
              Room,
              {
                id: roomId,
              },
              _.omit(body, 'media'),
            );
          }

          // Cập nhật media
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
          await queryRunner.commitTransaction();
          return null;
        }
        throw new ConflictException('Room type name already exists');
      }
      throw new NotFoundException('Room type not found');
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
