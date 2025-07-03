import { Body, Controller, Param, Post, Put, UseGuards } from "@nestjs/common";
import { RoomService } from "./room.service";
import { AppResponse } from "common/http/wrapper.http";
import { CreateRoomReqDto } from "./dtos/create-room.dto";
import { Roles } from "common/decorators/roles.decorator";
import { Role } from "common/constants/user.constants";
import { RolesGuard } from "common/guards/roles.guard";
import { UpdateRoomReqDto } from "./dtos/update-room.dto";

@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async createRoom(
    @Body() createRoomBody: CreateRoomReqDto
  ) {
    return AppResponse.ok(await this.roomService.createRoom(createRoomBody))
  }

  @Put(':roomId')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateRoom(
    @Param('roomId') roomId: number,
    @Body() updateRoomBody: UpdateRoomReqDto
  ) {
    return AppResponse.ok(await this.roomService.updateRoom(roomId, updateRoomBody))
  }
}