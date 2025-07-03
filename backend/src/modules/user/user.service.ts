import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { SignUpReqDto } from "./dtos/sign-up.dto";
import { Role } from "common/constants/user.constants";
import * as bcrypt from 'bcrypt';
import { SignInReqDto } from "./dtos/sign-in.dto";
import { JwtService } from "common/jwt/jwt.service";
import { RefreshTokenReqDto } from "./dtos/refresh-token.dto";
import { ConfigService } from "common/config/config.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async signUp(body: SignUpReqDto) {
    // Kiểm tra số điện thoại đã được đăng ký với tài khoản nào hay chưa
    const user = await this.userRepository.findOne({
      where: {
        phone: body.phone
      }
    })
    if (user) {
      throw new ConflictException('Account already exists');
    }

    // Tạo tài khoản mới
    const userEntity = this.userRepository.create({
      name: body.name,
      phone: body.phone,
      gender: body.gender,
      dob: body.dob,
      role: Role.USER,
      passwordHash: await bcrypt.hash(body.password, 10)
    });
    return this.userRepository.save(userEntity);
  }

  async signIn(body: SignInReqDto) {
    const user = await this.userRepository.findOne({
      where: {
        phone: body.phone
      }
    })
    // Kiểm tra xem thông tin đăng nhập chính xác hay không
    if (user) {
      const isCorrectPassword = await bcrypt.compare(body.password, user.passwordHash);
      if (isCorrectPassword) {
        return this.jwtService.generateToken({
          id: user.id,
          role: user.role as Role,
          iat: Date.now()
        })
      }
    }
    throw new UnauthorizedException('Incorrect phone number or password')
  }

  refreshToken(body: RefreshTokenReqDto) {
    try {
      // Xác thực refreshToken
      this.jwtService.verify(body.refreshToken, this.configService.getJwtConfig().refreshTokenSecret)

      // Tạo cặp token mới
      const jwtPayload = this.jwtService.decode(body.refreshToken)
      return this.jwtService.generateToken({
        id: jwtPayload.id,
        role: jwtPayload.role,
        iat: Date.now()
      })
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired')
    }
  }
}