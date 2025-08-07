import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomType } from './entities/room-type.entity';
import { Brackets, DataSource, QueryFailedError, Repository } from 'typeorm';
import { CreateRoomTypeReqDto } from './dtos/create-room-type.dto';
import { UpdateRoomTypeReqDto } from './dtos/update-room-type.dto';
import { GetRoomTypesReqDto } from './dtos/get-room-type.dto';

@Injectable()
export class RoomTypeService {
  constructor(
    @InjectRepository(RoomType)
    private readonly roomTypeRepository: Repository<RoomType>,
    private readonly dataSource: DataSource,
  ) {}

  async getRoomTypes(getRoomTypeQuery: GetRoomTypesReqDto) {
    return this.roomTypeRepository
      .createQueryBuilder('roomType')
      .leftJoinAndSelect('roomType.roomTypeAddons', 'roomTypeAddons')
      .where(
        new Brackets((qb) => {
          if (getRoomTypeQuery.keyword) {
            qb.where('roomType.name = :name', {
              name: getRoomTypeQuery.keyword,
            });
            if (!isNaN(Number(getRoomTypeQuery.keyword))) {
              qb.orWhere('roomType.id = :id', {
                id: Number(getRoomTypeQuery.keyword),
              });
            }
          }
        }),
      )
      .orderBy('roomType.id', 'DESC')
      .skip((getRoomTypeQuery.page - 1) * getRoomTypeQuery.limit)
      .take(getRoomTypeQuery.limit)
      .getManyAndCount();
  }

  async createRoomType(body: CreateRoomTypeReqDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Kiểm tra room type name
      const roomType = await this.roomTypeRepository.findOne({
        where: {
          name: body.name,
        },
      });
      if (roomType) {
        throw new ConflictException('Room type name already exists');
      }

      // Tạo room type mới
      const roomTypeEntity = this.roomTypeRepository.create({
        name: body.name,
        minPrice: body.minPrice,
        maxPrice: body.maxPrice,
        description: body.description,
      });
      const newRoomType = await this.roomTypeRepository.save(roomTypeEntity);

      await queryRunner.commitTransaction();
      return newRoomType;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateRoomType(roomTypeId: number, body: UpdateRoomTypeReqDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Kiểm tra room type
      const roomType = await queryRunner.manager.findOne(RoomType, {
        where: {
          id: roomTypeId,
        },
      });
      if (roomType) {
        // Cập nhật thông tin room type vào CSDL
        const updateResult = await queryRunner.manager.update(
          RoomType,
          {
            id: roomTypeId,
          },
          body,
        );

        await queryRunner.commitTransaction();
        return updateResult;
      }
      throw new NotFoundException('Room type not found');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteRoomType(roomTypeId: number) {
    try {
      const deleteResult = await this.roomTypeRepository.delete({
        id: roomTypeId,
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
