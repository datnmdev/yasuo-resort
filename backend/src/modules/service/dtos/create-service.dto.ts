import { IsCurrency, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateServiceReqDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsCurrency()
  price: string;

  @IsOptional()
  @IsString()
  description: string;
}