import { IsEmail, IsNotEmpty } from "class-validator";

export class SendOtpReqDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}