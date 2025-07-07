import { IsEmail, IsNotEmpty, IsNumberString, Length } from "class-validator";

export class VerifyAccountReqDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(6, 6)
  otp: string;
}