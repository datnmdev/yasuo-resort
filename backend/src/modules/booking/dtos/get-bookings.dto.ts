import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { JsonToObject } from 'common/decorators/transform.decorator';
import { ArrayElementsIn } from 'common/decorators/validation.decorator';

export class GetBookingReqDto {
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  id: number;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  userId: number;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  roomId: number;

  @JsonToObject()
  @IsOptional()
  @ArrayElementsIn(['pending', 'confirmed', 'rejected', 'cancelled'])
  status: string[] = ['pending', 'confirmed', 'rejected', 'cancelled'];

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
