import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomType } from './entities/room-type.entity';
import { Brackets, QueryFailedError, Repository } from 'typeorm';
import { CreateRoomTypeReqDto } from './dtos/create-room-type.dto';
import { UpdateRoomTypeReqDto } from './dtos/update-room-type.dto';
import { GetRoomTypesReqDto } from './dtos/get-room-type.dto';

@Injectable()
export class RoomTypeService {
  constructor(
    @InjectRepository(RoomType)
    private readonly roomTypeRepository: Repository<RoomType>,
  ) {}

  async getRoomTypes(getRoomTypeQuery: GetRoomTypesReqDto) {
    return this.roomTypeRepository
      .createQueryBuilder('roomType')
      .where(
        new Brackets((qb) => {
          if (getRoomTypeQuery.name) {
            qb.where('roomType.name = :name', {
              name: getRoomTypeQuery.name,
            });
          }
        }),
      )
      .skip((getRoomTypeQuery.page - 1) * getRoomTypeQuery.limit)
      .take(getRoomTypeQuery.limit)
      .getManyAndCount();
  }

  async createRoomType(body: CreateRoomTypeReqDto) {
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
      pricePerDay: body.pricePerDay,
      description: body.description,
    });
    return this.roomTypeRepository.save(roomTypeEntity);
  }

  async updateRoomType(roomTypeId: number, body: UpdateRoomTypeReqDto) {
    // Kiểm tra room type
    const roomType = await this.roomTypeRepository.findOne({
      where: {
        id: roomTypeId,
      },
    });
    if (roomType) {
      // Cập nhật thông tin room type vào CSDL
      return this.roomTypeRepository.update(
        {
          id: roomTypeId,
        },
        body,
      );
    }
    throw new NotFoundException('Room type not found');
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
