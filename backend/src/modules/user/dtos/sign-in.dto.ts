import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class SignInReqDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}