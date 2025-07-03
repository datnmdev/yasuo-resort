import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { RoomService } from "./room.service";
import { AppResponse } from "common/http/wrapper.http";
import { CreateRoomReqDto } from "./dtos/create-room.dto";
import { Roles } from "common/decorators/roles.decorator";
import { Role } from "common/constants/user.constants";
import { RolesGuard } from "common/guards/roles.guard";

@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async createRoom(
    @Body() roomBody: CreateRoomReqDto
  ) {
    return AppResponse.ok(await this.roomService.createRoom(roomBody))
  }
}