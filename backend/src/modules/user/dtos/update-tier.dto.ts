import { IsCurrency, IsInt, IsOptional, IsString } from "class-validator";

export class UpdateTierReqDto {
  @IsOptional()
  @IsString()
  tierName: string;

  @IsOptional()
  @IsString()
  tierSlug: string;

  @IsOptional()
  @IsInt()
  tierOrder: number;

  @IsOptional()
  @IsCurrency()
  minSpending: string;

  @IsOptional()
  @IsInt()
  minBookings: number;

  @IsOptional()
  @IsInt()
  durationMonths: number;

  @IsOptional()
  @IsString()
  description: string;
}