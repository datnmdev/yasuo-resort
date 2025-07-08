import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { OneOf } from 'common/decorators/validation.decorator';

export class SignUpReqDto {
  @IsNotEmpty()
  @IsNumberString()
  @Length(12, 12)
  cccd: string;

  @IsNotEmpty()
  @IsDateString()
  identityIssuedAt: string;

  @IsNotEmpty()
  @IsString()
  identityIssuedPlace: string;

  @IsNotEmpty()
  @IsString()
  permanentAddress: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

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
  @OneOf(['male', 'female', 'other'])
  gender: 'male' | 'female' | 'other';

  @IsNotEmpty()
  @IsString()
  password: string;
}
