import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { RoomCurrentCondition, RoomStatus } from "common/constants/room.constants";
import { OneOf } from "common/decorators/validation.decorator";

export class CreateRoomReqDto {
  @IsNotEmpty()
  @IsString()
  roomNumber: string;

  @IsNotEmpty()
  @IsInt()
  typeId: number;

  @IsNotEmpty()
  @OneOf([
    RoomStatus.ACTIVE,
    RoomStatus.INACTIVE,
    RoomStatus.UNDER_MAINTENANCE,
    RoomStatus.RETIRED
  ])
  status: 'active' | 'inactive' | 'under_maintenance' | 'retired';

  @IsOptional()
  @OneOf([
    RoomCurrentCondition.AVAILABLE
  ])
  currentCondition: 'available';
}