import { IsCurrency, IsOptional, IsString } from "class-validator";
import { OneOf } from "common/decorators/validation.decorator";

export class UpdateServiceReqDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsCurrency()
  price: string;

  @IsOptional()
  @OneOf([
    "active",
    "inactive",
  ])
  status: "active" | "inactive";

  @IsOptional()
  @IsString()
  description: string;
}