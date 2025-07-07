import { IsJWT, IsNotEmpty } from "class-validator";

export class RefreshTokenReqDto {
  @IsNotEmpty()
  @IsJWT()
  accessToken: string;

  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;
}