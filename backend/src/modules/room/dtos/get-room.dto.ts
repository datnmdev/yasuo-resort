import { Transform, Type } from 'class-transformer';
import {
  IsCurrency,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { RoomStatus } from 'common/constants/room.constants';
import { JsonToObject } from 'common/decorators/transform.decorator';
import { ArrayElementsIn } from 'common/decorators/validation.decorator';

class PriceRangeQueryDto {
  @IsNotEmpty()
  @IsCurrency()
  minPrice: string;

  @IsNotEmpty()
  @IsCurrency()
  maxPrice: string;
}

class DateRangeQueryDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}

export class GetRoomsReqDto {
  @IsOptional()
  @IsString()
  keyword: string;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  typeId: number;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  maxPeople: number;

  @IsOptional()
  @JsonToObject()
  @ArrayElementsIn([
    RoomStatus.ACTIVE,
    RoomStatus.INACTIVE,
    RoomStatus.MAINTENANCE,
  ])
  status: string[] = [RoomStatus.ACTIVE];

  @JsonToObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => PriceRangeQueryDto)
  priceRange: PriceRangeQueryDto;

  @JsonToObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeQueryDto)
  dateRange: DateRangeQueryDto;

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
