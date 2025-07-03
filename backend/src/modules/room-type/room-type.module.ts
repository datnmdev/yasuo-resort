import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoomType } from "./entities/room-type.entity";
import { RoomTypeController } from "./room-type.controller";
import { RoomTypeService } from "./room-type.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomType
    ])
  ],
  controllers: [
    RoomTypeController
  ],
  providers: [
    RoomTypeService
  ],
  exports: []
})
export class RoomTypeModule {}