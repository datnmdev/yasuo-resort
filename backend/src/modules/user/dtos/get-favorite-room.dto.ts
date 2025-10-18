import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, Min } from "class-validator";

export class GetFavoriteRoomReqDto {
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  roomId: number;

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
