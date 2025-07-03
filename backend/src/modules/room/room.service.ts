import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Room } from "./entities/room.entity";
import { Repository } from "typeorm";
import { CreateRoomReqDto } from "./dtos/create-room.dto";
import { UpdateRoomTypeReqDto } from "modules/room-type/dtos/update-room-type.dto";
import { UpdateRoomReqDto } from "./dtos/update-room.dto";

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>
  ) {}

  async createRoom(body: CreateRoomReqDto) {
    // Kiểm tra room number
    const room = await this.roomRepository.findOne({
      where: {
        roomNumber: body.roomNumber
      }
    })
    if (room) {
      throw new ConflictException('Room number already exists')
    }

    // Tạo room mới
    const roomEntity = this.roomRepository.create(body)
    return this.roomRepository.save(roomEntity)
  }

  async updateRoom(roomId: number, body: UpdateRoomReqDto) {
    if (Object.keys(body).length === 0) {
      return null
    }

    // Kiểm tra room
    const room = await this.roomRepository.findOne({
      where: {
        id: roomId,
      },
    });
    if (room) {
      const isValidRoomNumber = body.roomNumber && (await this.roomRepository.findOne({
        where: {
          roomNumber: body.roomNumber,
        },
      }))
        ? true
        : false;
      if (!isValidRoomNumber) {
        // Cập nhật thông tin room vào CSDL
        return this.roomRepository.update({
          id: roomId
        }, body);
      }
      throw new ConflictException('Room type name already exists');
    }
    throw new NotFoundException('Room type not found');
  }
}