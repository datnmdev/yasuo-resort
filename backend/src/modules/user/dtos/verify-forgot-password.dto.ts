import { IsEmail, IsNotEmpty, IsNumberString, Length } from "class-validator";

export class VerifyForgotPasswordReqDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(6, 6)
  otp: string;
}