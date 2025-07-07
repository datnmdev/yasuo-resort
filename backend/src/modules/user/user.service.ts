import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { SignUpReqDto } from "./dtos/sign-up.dto";
import { Role, UserStatus } from "common/constants/user.constants";
import * as bcrypt from 'bcrypt';
import { SignInReqDto } from "./dtos/sign-in.dto";
import { JwtService } from "common/jwt/jwt.service";
import { RefreshTokenReqDto } from "./dtos/refresh-token.dto";
import { ConfigService } from "common/config/config.service";
import { REDIS_CLIENT } from "common/redis/redis.constants";
import { RedisClient } from "common/redis/redis.type";
import { SignOutReqDto } from "./dtos/sign-out.dto";
import { VerifyAccountReqDto } from "./dtos/verify-account.dto";
import { SendOtpReqDto } from "./dtos/send-otp.dto";
import * as randomString from 'randomstring';
import { MailService } from "common/mail/mail.service";
import { plainToInstance } from "class-transformer";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: RedisClient,
    private readonly mailService: MailService
  ) {}

  async signUp(body: SignUpReqDto) {
    // Kiểm tra email đã được đăng ký với tài khoản nào hay chưa
    const user = await this.userRepository.findOne({
      where: {
        email: body.email
      }
    })
    if (user) {
      throw new ConflictException('Account already exists');
    }

    // Tạo tài khoản mới
    const userEntity = this.userRepository.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      gender: body.gender,
      dob: body.dob,
      status: 'inactive',
      role: Role.USER,
      passwordHash: await bcrypt.hash(body.password, 10)
    });
    return this.userRepository.save(userEntity);
  }

  async signIn(body: SignInReqDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: body.email
      }
    })
    // Kiểm tra xem thông tin đăng nhập chính xác hay không
    if (user) {
      if (user.status === 'active') {
        const isCorrectPassword = await bcrypt.compare(body.password, user.passwordHash);
        if (isCorrectPassword) {
          return this.jwtService.generateToken({
            id: user.id,
            role: user.role as Role,
            status: user.status as UserStatus
          })
        }
      }
      await this.sendOtp(plainToInstance(SendOtpReqDto, {
        email: user.email
      }))
      throw new ForbiddenException({
        message: 'Account not activated yet',
        error: 'AccountNotActivated'
      })
    }
    throw new UnauthorizedException('Incorrect phone number or password')
  }

  async refreshToken(body: RefreshTokenReqDto) {
    try {
      // Xác thực refreshToken
      this.jwtService.verify(body.refreshToken, this.configService.getJwtConfig().refreshTokenSecret)

      // Đưa cặp token cũ vào blacklist
      const accessTokenPayload = this.jwtService.decode(body.accessToken)
      const refreshTokenPayload = this.jwtService.decode(body.refreshToken)
      const accessTokenExpireIn = accessTokenPayload.exp - Math.ceil(Date.now() / 1000)
      const refreshTokenExpireIn = refreshTokenPayload.exp - Math.ceil(Date.now() / 1000)
      await this.redisClient.multi()
        .setEx(`TOKEN_BLACKLIST_${accessTokenPayload.jti}`, accessTokenExpireIn > 0 ? accessTokenExpireIn : 1, "1")
        .setEx(`TOKEN_BLACKLIST_${refreshTokenPayload.jti}`, refreshTokenExpireIn > 0 ? refreshTokenExpireIn : 1, "1")
        .exec()

      // Tạo cặp token mới
      const jwtPayload = this.jwtService.decode(body.refreshToken)
      return this.jwtService.generateToken({
        id: jwtPayload.id,
        role: jwtPayload.role,
        status: jwtPayload.status
      })
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired')
    }
  }

  async signOut(body: SignOutReqDto) {
    // Đưa cặp token vào blacklist
    const accessTokenPayload = this.jwtService.decode(body.accessToken)
    const refreshTokenPayload = this.jwtService.decode(body.refreshToken)
    const accessTokenExpireIn = accessTokenPayload.exp - Math.ceil(Date.now() / 1000)
    const refreshTokenExpireIn = refreshTokenPayload.exp - Math.ceil(Date.now() / 1000)
    await this.redisClient.multi()
      .setEx(`TOKEN_BLACKLIST_${accessTokenPayload.jti}`, accessTokenExpireIn > 0 ? accessTokenExpireIn : 1, "1")
      .setEx(`TOKEN_BLACKLIST_${refreshTokenPayload.jti}`, refreshTokenExpireIn > 0 ? refreshTokenExpireIn : 1, "1")
      .exec()
    return null;
  }

  async verifyAccount(body: VerifyAccountReqDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: body.email
      }
    })
    if (user) {
      if (body.otp === await this.redisClient.get(`otp::${user.id}`)) {
        await this.userRepository.update({
          id: user.id
        }, {
          status: UserStatus.ACTIVE
        })
        await this.redisClient.del(`otp::${user.id}`)
        return null;
      }
      throw new UnauthorizedException({
        error: 'OtpInvalid',
        message: 'The OTP code is incorrect'
      })
    }
    throw new NotFoundException({
      error: 'UserNotFound',
      message: 'User with this email does not exist'
    }) 
  }

  async sendOtp(body: SendOtpReqDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: body.email
      }
    })
    if (user) {
      const otp = randomString.generate({
        length: 6,
        charset: 'numeric'
      })
      await this.redisClient.setEx(`otp::${user.id}`, 5 *60, otp)
      await this.mailService.sendOtp(otp, user.email)
      return null;
    }
    throw new NotFoundException({
      error: 'UserNotFound',
      message: 'User with this email does not exist'
    })
  }
}