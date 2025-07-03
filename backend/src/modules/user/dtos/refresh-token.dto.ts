import { IsJWT, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class RefreshTokenReqDto {
  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;
}