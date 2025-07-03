import { IsCurrency, IsOptional, IsString } from "class-validator";

export class UpdateRoomTypeReqDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsCurrency()
  pricePerDay: string;

  @IsOptional()
  @IsString()
  description: string;
}