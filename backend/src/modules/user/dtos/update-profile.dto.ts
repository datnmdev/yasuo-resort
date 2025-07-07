import { IsDateString, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { OneOf } from "common/decorators/validation.decorator";

export class UpdateProfileReqDto {
  @IsOptional()
  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsDateString()
  dob: string;

  @IsOptional()
  @IsString()
  @OneOf([
    'male',
    'female',
    'other'
  ])
  gender: 'male' | 'female' | 'other';

  @IsOptional()
  @IsString()
  avatar: string;
}