import {
  IsArray,
  IsCurrency,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateRoomTypeReqDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsCurrency()
  minPrice: string;

  @IsOptional()
  @IsCurrency()
  maxPrice: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  serviceIds: number[];
}
