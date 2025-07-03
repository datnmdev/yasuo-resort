import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Room } from "./entities/room.entity";
import { Brackets, Repository } from "typeorm";
import { CreateRoomReqDto } from "./dtos/create-room.dto";
import { UpdateRoomReqDto } from "./dtos/update-room.dto";
import { GetRoomsReqDto } from "./dtos/get-room.dto";

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>
  ) {}

  getRooms(query: GetRoomsReqDto) {
    return this.roomRepository.createQueryBuilder('room')
      .where(new Brackets(qb => {
        if (typeof query.roomNumber === 'string') {
          qb.where('room.roomNumber = :roomNumber', {
            roomNumber: query.roomNumber
          })
        }
      }))
      .andWhere(new Brackets(qb => {
        if (typeof query.typeId === 'number') {
          qb.where('room.typeId = :typeId', {
            typeId: query.typeId
          })
        }
      }))
      .andWhere(new Brackets(qb => {
        if (query.status instanceof Array) {
          query.status.forEach((e, i) => {
            if (i === 0) {
              qb.where(`room.status = :status0`, {
                status0: e
              })
            } else {
              qb.orWhere(`room.status = :status${i}`, {
                [`status${i}`]: e
              })
            }
          })
        }
      }))
      .andWhere(new Brackets(qb => {
        if (query.currentCondition instanceof Array) {
          query.currentCondition.forEach((e, i) => {
            if (i === 0) {
              qb.where(`room.current_condition = :currentCondition0`, {
                currentCondition0: e
              })
            } else {
              qb.orWhere(`room.current_condition = :currentCondition${i}`, {
                [`currentCondition${i}`]: e
              })
            }
          })
        }
      }))
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount()
  }

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