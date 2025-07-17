import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';

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
}
