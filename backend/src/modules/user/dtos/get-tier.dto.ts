import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class GetTierReqDto {
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  tierName: string;

  @IsOptional()
  @IsString()
  tierSlug: string;

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
