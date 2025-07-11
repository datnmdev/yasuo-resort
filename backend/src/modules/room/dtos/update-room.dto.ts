import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  RoomCurrentCondition,
  RoomStatus,
} from 'common/constants/room.constants';
import { OneOf } from 'common/decorators/validation.decorator';

export class UpdateRoomReqDto {
  @IsOptional()
  @IsString()
  roomNumber: string;

  @IsOptional()
  @IsInt()
  typeId: number;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @OneOf([
    RoomStatus.ACTIVE,
    RoomStatus.INACTIVE,
    RoomStatus.UNDER_MAINTENANCE,
    RoomStatus.RETIRED,
  ])
  status: 'active' | 'inactive' | 'under_maintenance' | 'retired';

  @IsOptional()
  @OneOf([RoomCurrentCondition.AVAILABLE, RoomCurrentCondition.BOOKED])
  currentCondition: 'available' | 'booked';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  media: string[];
}
