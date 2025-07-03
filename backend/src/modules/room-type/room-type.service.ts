import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RoomType } from "./entities/room-type.entity";
import { Repository } from "typeorm";
import { CreateRoomTypeReqDto } from "./dtos/create-room-type.dto";

@Injectable()
export class RoomTypeService {
  constructor(
    @InjectRepository(RoomType)
    private readonly roomTypeRepository: Repository<RoomType>
  ) {}

  async createRoomType(body: CreateRoomTypeReqDto) {
    // Kiểm tra room type name
    const roomType = await this.roomTypeRepository.findOne({
      where: {
        name: body.name
      }
    })
    if (roomType) {
      throw new ConflictException('Room type name already exists')
    }

    // Tạo room type mới
    const roomTypeEntity = this.roomTypeRepository.create({
      name: body.name,
      pricePerDay: body.pricePerDay,
      description: body.description
    })
    return this.roomTypeRepository.save(roomTypeEntity)
  }
}