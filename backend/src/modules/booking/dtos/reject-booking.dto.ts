import { IsNotEmpty, IsString } from 'class-validator';

export class RejectBookingReqDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}
