import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { OneOf } from 'common/decorators/validation.decorator';

export class GetFeedbackReqDto {
  @IsNotEmpty()
  @IsString()
  @OneOf(['room', 'service', 'combo'])
  targetType: 'room' | 'service' | 'combo';

  @IsOptional()
  @IsString()
  @OneOf(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

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
