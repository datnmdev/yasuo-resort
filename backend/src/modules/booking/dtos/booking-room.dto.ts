import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
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
  @IsInt({ each: true })
  serviceIds?: number[];

  @IsOptional()
  @IsInt()
  userVoucherId?: number;

  @IsOptional()
  @IsInt()
  comboId: number;
}
