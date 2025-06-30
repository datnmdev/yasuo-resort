import { IsDateString, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";
import { OneOf } from "common/decorators/validation.decorator";

export class SignUpReqDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsDateString()
  dob: string;

  @IsNotEmpty()
  @IsString()
  @OneOf([
    'male',
    'female',
    'other'
  ])
  gender: 'male' | 'female' | 'other';

  @IsNotEmpty()
  @IsString()
  password: string;
}