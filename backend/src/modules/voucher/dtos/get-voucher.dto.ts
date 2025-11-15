import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";
import { OneOf } from "common/decorators/validation.decorator";

export class GetVoucherReqDto {
  @IsNotEmpty()
  @IsString()
  @OneOf(['admin', 'customer'])
  role: 'admin' | 'customer';

  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  page: number;

  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  limit: number;
}