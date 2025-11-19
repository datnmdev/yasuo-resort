import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class BookingRoomReqDto {
  @IsNotEmpty()
  @IsInt()
  roomId: number;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsNotEmpty()
  @IsInt()
  capacity: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachedServiceDto)
  attachedService?: AttachedServiceDto[];

  @IsOptional()
  @IsInt()
  userVoucherId?: number;

  @IsOptional()
  @IsInt()
  comboId: number;
}

class AttachedServiceDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsInt()
  quantity: number;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}