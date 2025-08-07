import { IsNotEmpty, IsString } from 'class-validator';

export class RejectServiceBookingReqDto {
  @IsNotEmpty()
  @IsString()
  reasonForRejection: string;
}
