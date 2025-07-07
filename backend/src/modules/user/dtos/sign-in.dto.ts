import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInReqDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}