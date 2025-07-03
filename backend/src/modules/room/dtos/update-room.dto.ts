import { IsInt, IsOptional, IsString } from "class-validator";
import { RoomCurrentCondition, RoomStatus } from "common/constants/room.constants";
import { OneOf } from "common/decorators/validation.decorator";

export class UpdateRoomReqDto {
  @IsOptional()
  @IsString()
  roomNumber: string;

  @IsOptional()
  @IsInt()
  typeId: number;

  @IsOptional()
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