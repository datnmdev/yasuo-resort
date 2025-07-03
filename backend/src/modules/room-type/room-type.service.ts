import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomType } from './entities/room-type.entity';
import { Repository } from 'typeorm';
import { CreateRoomTypeReqDto } from './dtos/create-room-type.dto';
import { UpdateRoomTypeReqDto } from './dtos/update-room-type.dto';

@Injectable()
export class RoomTypeService {
  constructor(
    @InjectRepository(RoomType)
    private readonly roomTypeRepository: Repository<RoomType>,
  ) {}

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
      const isValidName = (await this.roomTypeRepository.findOne({
        where: {
          name: body.name,
        },
      }))
        ? true
        : false;
      if (!isValidName) {
        // Cập nhật thông tin room type vào CSDL
        return this.roomTypeRepository.update({
          id: roomTypeId
        }, body);
      }
      throw new ConflictException('Room type name already exists');
    }
    throw new NotFoundException('Room type not found');
  }
}
