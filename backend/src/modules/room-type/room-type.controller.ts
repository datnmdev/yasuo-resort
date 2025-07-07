import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { RoomTypeService } from "./room-type.service";
import { CreateRoomTypeReqDto } from "./dtos/create-room-type.dto";
import { AppResponse } from "common/http/wrapper.http";
import { Roles } from "common/decorators/roles.decorator";
import { Role } from "common/constants/user.constants";
import { RolesGuard } from "common/guards/roles.guard";
import { UpdateRoomTypeReqDto } from "./dtos/update-room-type.dto";
import { GetRoomTypesReqDto } from "./dtos/get-room-type.dto";

@Controller('room-type')
export class RoomTypeController {
  constructor(
    private readonly roomTypeService: RoomTypeService
  ) {}

  @Get()
  async getRoomTypes(
    @Query() getRoomTypeQuery: GetRoomTypesReqDto
  ) {
    return AppResponse.ok(await this.roomTypeService.getRoomTypes(getRoomTypeQuery))
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async createRoomType(
    @Body() createRoomTypeBody: CreateRoomTypeReqDto
  ) {
    return AppResponse.ok(await this.roomTypeService.createRoomType(createRoomTypeBody))
  }

  @Put(':roomTypeId')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateRoomType(
    @Param('roomTypeId') roomTypeId: number,
    @Body() updateRoomTypeBody: UpdateRoomTypeReqDto
  ) {
    return AppResponse.ok(await this.roomTypeService.updateRoomType(roomTypeId, updateRoomTypeBody))
  }

  @Delete(':roomTypeId')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async deleteRoomType(
    @Param('roomTypeId') roomTypeId: number
  ) {
    return AppResponse.ok(await this.roomTypeService.deleteRoomType(roomTypeId))
  }
}