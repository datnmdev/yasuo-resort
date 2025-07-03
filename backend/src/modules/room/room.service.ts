import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Room } from "./entities/room.entity";
import { Repository } from "typeorm";
import { CreateRoomReqDto } from "./dtos/create-room.dto";

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
}