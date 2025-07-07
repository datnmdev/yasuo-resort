import { Body, Controller, Post, Put } from '@nestjs/common';
import { AuthService } from './user.service';
import { SignUpReqDto } from './dtos/sign-up.dto';
import { AppResponse } from 'common/http/wrapper.http';
import { SignInReqDto } from './dtos/sign-in.dto';
import { RefreshTokenReqDto } from './dtos/refresh-token.dto';
import { MailService } from 'common/mail/mail.service';
import * as randomstring from 'randomstring';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  @Post('sign-up')
  async signUp(@Body() signUpBody: SignUpReqDto) {
    const newUser = await this.authService.signUp(signUpBody);

    // Gửi email thông báo xác thực tài khoản
    await this.mailService.sendOtpToVerifyAccount(
      randomstring.generate({
        length: 6,
        charset: 'numeric',
      }),
      newUser.email,
    );
    return AppResponse.ok(newUser);
  }

  @Post('sign-in')
  async signIn(@Body() signInBody: SignInReqDto) {
    return AppResponse.ok(await this.authService.signIn(signInBody));
  }

  @Put('refresh-token')
  async refreshToken(@Body() refreshTokenBody: RefreshTokenReqDto) {
    return AppResponse.ok(
      await this.authService.refreshToken(refreshTokenBody),
    );
  }
}
