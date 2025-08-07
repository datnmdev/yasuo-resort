import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class ChangeRoomReqDto {
  @IsNotEmpty()
  @IsInt()
  bookingId: number;

  @IsNotEmpty()
  @IsInt()
  toRoomId: number;

  @IsNotEmpty()
  @IsDateString()
  changeDate: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}
