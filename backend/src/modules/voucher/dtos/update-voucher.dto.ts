import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateVoucherReqDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  claimLimit: number;
}
