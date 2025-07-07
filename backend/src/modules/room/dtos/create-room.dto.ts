import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { RoomCurrentCondition, RoomStatus } from "common/constants/room.constants";
import { OneOf } from "common/decorators/validation.decorator";

export class CreateRoomReqDto {
  @IsNotEmpty()
  @IsString()
  roomNumber: string;

  @IsNotEmpty()
  @IsInt()
  typeId: number;

  @IsOptional()
  @IsString()
  description: string;

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

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  media: string[];
}