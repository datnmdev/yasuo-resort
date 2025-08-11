import {
  ArrayMinSize,
  IsArray,
  IsCurrency,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { RoomStatus } from 'common/constants/room.constants';
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
  @OneOf([RoomStatus.ACTIVE, RoomStatus.MAINTENANCE])
  status: 'active' | 'maintenance';

  @IsOptional()
  @IsInt()
  maxPeople: number;

  @IsOptional()
  @IsCurrency()
  price: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  media: string[];

  @IsOptional()
  @IsDateString()
  maintenanceStartDate: string;
}
