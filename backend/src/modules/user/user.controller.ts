import { Body, Controller, Post, Put } from "@nestjs/common";
import { AuthService } from "./user.service";
import { SignUpReqDto } from "./dtos/sign-up.dto";
import { AppResponse } from "common/http/wrapper.http";
import { SignInReqDto } from "./dtos/sign-in.dto";
import { RefreshTokenReqDto } from "./dtos/refresh-token.dto";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('sign-up')
  async signUp(
    @Body() signUpBody: SignUpReqDto
  ) {
    return AppResponse.ok(await this.authService.signUp(signUpBody));
  }

  @Post('sign-in')
  async signIn(
    @Body() signInBody: SignInReqDto
  ) {
    return AppResponse.ok(await this.authService.signIn(signInBody));
  }

  @Put('refresh-token')
  async refreshToken(
    @Body() refreshTokenBody: RefreshTokenReqDto
  ) {
    return AppResponse.ok(await this.authService.refreshToken(refreshTokenBody));
  } 
}
