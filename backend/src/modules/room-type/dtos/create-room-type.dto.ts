import { IsCurrency, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRoomTypeReqDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsCurrency()
  pricePerDay: string;

  @IsOptional()
  @IsString()
  description: string;
}