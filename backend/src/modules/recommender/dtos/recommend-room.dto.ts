import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class RecommendRoomReqDto {
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
