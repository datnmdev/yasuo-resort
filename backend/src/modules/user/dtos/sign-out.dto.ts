import { IsJWT, IsNotEmpty } from "class-validator";

export class SignOutReqDto {
  @IsNotEmpty()
  @IsJWT()
  accessToken: string;

  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;
}