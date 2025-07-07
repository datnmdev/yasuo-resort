import { IsCurrency, IsOptional, IsString } from "class-validator";

export class UpdateServiceReqDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsCurrency()
  price: string;

  @IsOptional()
  @IsString()
  description: string;
}