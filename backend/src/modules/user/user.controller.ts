import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { AuthService, UserService } from './user.service';
import { SignUpReqDto } from './dtos/sign-up.dto';
import { AppResponse } from 'common/http/wrapper.http';
import { SignInReqDto } from './dtos/sign-in.dto';
import { RefreshTokenReqDto } from './dtos/refresh-token.dto';
import { SignOutReqDto } from './dtos/sign-out.dto';
import { VerifyAccountReqDto } from './dtos/verify-account.dto';
import { SendOtpReqDto } from './dtos/send-otp.dto';
import { plainToInstance } from 'class-transformer';
import { VerifyForgotPasswordReqDto } from './dtos/verify-forgot-password.dto';
import { ResetPasswordReqDto } from './dtos/reset-password.dto';
import { User } from 'common/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('sign-up')
  async signUp(@Body() signUpBody: SignUpReqDto) {
    const newUser = await this.authService.signUp(signUpBody);
    await this.sendOtp(plainToInstance(SendOtpReqDto, {
      email: newUser.email
    }))
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

  @Post('sign-out')
  async signOut(@Body() signOutBody: SignOutReqDto) {
    return AppResponse.ok(await this.authService.signOut(signOutBody));
  }

  @Post('verify-account')
  async verifyAccount(@Body() verifyAccountBody: VerifyAccountReqDto) {
    return AppResponse.ok(await this.authService.verifyAccount(verifyAccountBody));
  }

  @Post('/send-otp')
  async sendOtp(@Body() sendOtpBody: SendOtpReqDto) {
    return AppResponse.ok(await this.authService.sendOtp(sendOtpBody));
  }

  @Post('/verify-forgot-password')
  async verifyForgotPassword(@Body() verifyForgotPasswordBody: VerifyForgotPasswordReqDto) {
    return AppResponse.ok(await this.authService.verifyForgotPassword(verifyForgotPasswordBody));
  }

  @Put('/reset-password')
  async resetPassword(@Body() resetPasswordBody: ResetPasswordReqDto) {
    return AppResponse.ok(await this.authService.resetPassword(resetPasswordBody));
  }
}

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) {}

  @Get('get-profile')
  async getProfile(@User('id') userId: number) {
    return AppResponse.ok(await this.userService.getProfile(userId))
  }
}
