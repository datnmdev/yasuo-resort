import { IsArray, IsCurrency, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateComboReqDto {
  @IsNotEmpty()
  @IsInt()
  roomTypeId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountValue: number;

  @IsNotEmpty()
  @IsCurrency()
  maxDiscountAmount: string;

  @IsNotEmpty()
  @IsInt()
  minStayNights: number;

  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  serviceIds: number[];

}