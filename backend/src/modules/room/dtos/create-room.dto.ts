import {
  ArrayMinSize,
  IsArray,
  IsCurrency,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoomReqDto {
  @IsNotEmpty()
  @IsString()
  roomNumber: string;

  @IsNotEmpty()
  @IsInt()
  typeId: number;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsInt()
  maxPeople: number;

  @IsNotEmpty()
  @IsCurrency()
  price: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  media: string[];
}
