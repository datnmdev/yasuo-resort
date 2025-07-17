import {
  IsArray,
  IsCurrency,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoomTypeReqDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsCurrency()
  minPrice: string;

  @IsNotEmpty()
  @IsCurrency()
  maxPrice: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  serviceIds: number[];
}
