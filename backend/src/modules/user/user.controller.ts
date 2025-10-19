import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
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
import { UpdateProfileReqDto } from './dtos/update-profile.dto';
import * as _ from 'lodash';
import { CreateFavoriteRoomReqDto } from './dtos/create-favorite-room.dto';
import { CreateFavoriteServiceReqDto } from './dtos/create-favorite-service.dto';
import { GetFavoriteRoomReqDto } from './dtos/get-favorite-room.dto';
import { GetFavoriteServiceReqDto } from './dtos/get-favorite-service.dto';
import { Roles } from 'common/decorators/roles.decorator';
import { Role } from 'common/constants/user.constants';
import { CreateTierReqDto } from './dtos/create-tier.dto';
import { UpdateTierReqDto } from './dtos/update-tier.dto';
import { RolesGuard } from 'common/guards/roles.guard';
import { GetTierReqDto } from './dtos/get-tier.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() signUpBody: SignUpReqDto) {
    const newUser = await this.authService.signUp(signUpBody);
    await this.sendOtp(
      plainToInstance(SendOtpReqDto, {
        email: newUser.email,
      }),
    );
    return AppResponse.ok(_.omit(newUser, 'passwordHash'));
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
    return AppResponse.ok(
      await this.authService.verifyAccount(verifyAccountBody),
    );
  }

  @Post('/send-otp')
  async sendOtp(@Body() sendOtpBody: SendOtpReqDto) {
    return AppResponse.ok(await this.authService.sendOtp(sendOtpBody));
  }

  @Post('/verify-forgot-password')
  async verifyForgotPassword(
    @Body() verifyForgotPasswordBody: VerifyForgotPasswordReqDto,
  ) {
    return AppResponse.ok(
      await this.authService.verifyForgotPassword(verifyForgotPasswordBody),
    );
  }

  @Put('/reset-password')
  async resetPassword(@Body() resetPasswordBody: ResetPasswordReqDto) {
    return AppResponse.ok(
      await this.authService.resetPassword(resetPasswordBody),
    );
  }
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('get-profile')
  async getProfile(@User('id') userId: number) {
    return AppResponse.ok(await this.userService.getProfile(userId));
  }

  @Put('update-profile')
  async updateProfile(
    @User('id') userId: number,
    @Body() updateProfileBody: UpdateProfileReqDto,
  ) {
    return AppResponse.ok(
      await this.userService.updateProfile(userId, updateProfileBody),
    );
  }

  @Get('favorite-room')
  async getFavoriteRooms(
    @User('id') userId: number,
    @Query() getFavoriteRoomsQuery: GetFavoriteRoomReqDto,
  ) {
    return AppResponse.ok(
      await this.userService.getFavoriteRooms(userId, getFavoriteRoomsQuery),
    );
  }

  @Post('favorite-room')
  async createFavoriteRoom(
    @User('id') userId: number,
    @Body() createFavoriteRoomBody: CreateFavoriteRoomReqDto,
  ) {
    return AppResponse.ok(
      await this.userService.createFavoriteRoom(userId, createFavoriteRoomBody.roomId),
    );
  }

  @Delete('favorite-room/:id')
  async deleteFavoriteRoom(
    @User('id') userId: number,
    @Param('id') favoriteRoomId: number,
  ) {
    return AppResponse.ok(
      await this.userService.deleteFavoriteRoom(userId, favoriteRoomId),
    );
  }

  @Get('favorite-service')
  async getFavoriteServices(
    @User('id') userId: number,
    @Query() getFavoriteServicesQuery: GetFavoriteServiceReqDto,
  ) {
    return AppResponse.ok(
      await this.userService.getFavoriteServices(userId, getFavoriteServicesQuery),
    );
  }

  @Post('favorite-service')
  async createFavoriteService(
    @User('id') userId: number,
    @Body() createFavoriteServiceBody: CreateFavoriteServiceReqDto,
  ) {
    return AppResponse.ok(
      await this.userService.createFavoriteService(userId, createFavoriteServiceBody.serviceId),
    );
  }

  @Delete('favorite-service/:id')
  async deleteFavoriteService(
    @User('id') userId: number,
    @Param('id') favoriteServiceId: number,
  ) {
    return AppResponse.ok(
      await this.userService.deleteFavoriteService(userId, favoriteServiceId),
    );
  }

  @Get('tier')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getTier(
    @Query() getTierQuery: GetTierReqDto,
  ) {
    return AppResponse.ok(await this.userService.getTier(getTierQuery));
  }

  @Post('tier')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async createTier(
    @Body() createTierBody: CreateTierReqDto,
  ) {
    return AppResponse.ok(
      await this.userService.createTier(createTierBody),
    );
  }

  @Put('tier/:id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateTier(
    @Param('id') tierId: number,
    @Body() updateTierBody: UpdateTierReqDto,
  ) {
    return AppResponse.ok(
      await this.userService.updateTier(tierId, updateTierBody),
    );
  }

  @Delete('tier/:id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async deleteTier(
    @Param('id') tierId: number,
  ) {
    return AppResponse.ok(
      await this.userService.deleteTier(tierId),
    );
  }
}
