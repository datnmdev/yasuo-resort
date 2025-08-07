import {
  IsDateString,
  IsInt,
  IsOptional,
} from 'class-validator';

export class UpdateServiceBookingReqDto {
  @IsOptional()
  @IsInt()
  quantity: number;

  @IsOptional()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate: string;
}