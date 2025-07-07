import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class ResetPasswordReqDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(32)
  code: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}