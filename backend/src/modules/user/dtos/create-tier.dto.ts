import { IsCurrency, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTierReqDto {
  @IsNotEmpty()
  @IsString()
  tierName: string;

  @IsNotEmpty()
  @IsString()
  tierSlug: string;

  @IsNotEmpty()
  @IsInt()
  tierOrder: number;

  @IsNotEmpty()
  @IsCurrency()
  minSpending: string;

  @IsNotEmpty()
  @IsInt()
  minBookings: number;

  @IsOptional()
  @IsInt()
  durationMonths: number;

  @IsNotEmpty()
  @IsString()
  description: string;
}