import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { OneOf } from 'common/decorators/validation.decorator';

export class GetRevenueStatisticsReqDto {
  @IsNotEmpty()
  @IsString()
  @OneOf(['day', 'month', 'year'])
  timeUnit: 'day' | 'month' | 'year';

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
