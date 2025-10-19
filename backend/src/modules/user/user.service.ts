import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Brackets, Repository } from 'typeorm';
import { SignUpReqDto } from './dtos/sign-up.dto';
import { Role, UserStatus } from 'common/constants/user.constants';
import * as bcrypt from 'bcrypt';
import { SignInReqDto } from './dtos/sign-in.dto';
import { JwtService } from 'common/jwt/jwt.service';
import { RefreshTokenReqDto } from './dtos/refresh-token.dto';
import { ConfigService } from 'common/config/config.service';
import { REDIS_CLIENT } from 'common/redis/redis.constants';
import { RedisClient } from 'common/redis/redis.type';
import { SignOutReqDto } from './dtos/sign-out.dto';
import { VerifyAccountReqDto } from './dtos/verify-account.dto';
import { SendOtpReqDto } from './dtos/send-otp.dto';
import * as randomString from 'randomstring';
import { MailService } from 'common/mail/mail.service';
import { plainToInstance } from 'class-transformer';
import { VerifyForgotPasswordReqDto } from './dtos/verify-forgot-password.dto';
import { ResetPasswordReqDto } from './dtos/reset-password.dto';
import * as _ from 'lodash';
import { UpdateProfileReqDto } from './dtos/update-profile.dto';
import { access, unlink } from 'fs/promises';
import * as path from 'path';
import { FavoriteRoom } from './entities/favorite-room.entity';
import { FavoriteService } from './entities/favorite-service.entity';
import { GetFavoriteRoomReqDto } from './dtos/get-favorite-room.dto';
import { GetFavoriteServiceReqDto } from './dtos/get-favorite-service.dto';
import { CreateTierReqDto } from './dtos/create-tier.dto';
import { UserTier } from './entities/user-tier.entity';
import { UpdateTierReqDto } from './dtos/update-tier.dto';
import { GetTierReqDto } from './dtos/get-tier.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: RedisClient,
    private readonly mailService: MailService,
  ) {}

  async signUp(body: SignUpReqDto) {
    // Kiểm tra email đã được đăng ký với tài khoản nào hay chưa
    const user = await this.userRepository.findOne({
      where: {
        email: body.email,
      },
    });
    if (user) {
      throw new ConflictException('Account already exists');
    }

    // Tạo tài khoản mới
    const userEntity = this.userRepository.create({
      ...body,
      status: 'inactive',
      role: Role.CUSTOMER,
      passwordHash: await bcrypt.hash(body.password, 10),
    });
    return this.userRepository.save(userEntity);
  }

  async signIn(body: SignInReqDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: body.email,
      },
    });
    // Kiểm tra xem thông tin đăng nhập chính xác hay không
    if (user) {
      const isCorrectPassword = await bcrypt.compare(
        body.password,
        user.passwordHash,
      );
      if (isCorrectPassword) {
        if (user.status === 'active') {
          return this.jwtService.generateToken({
            id: user.id,
            role: user.role as Role,
            status: user.status as UserStatus,
          });
        }
        await this.sendOtp(
          plainToInstance(SendOtpReqDto, {
            email: user.email,
          }),
        );
        throw new ForbiddenException({
          message: 'Account not activated yet',
          error: 'AccountNotActivated',
        });
      }
    }
    throw new UnauthorizedException('Incorrect email or password');
  }

  async refreshToken(body: RefreshTokenReqDto) {
    try {
      // Xác thực refreshToken
      this.jwtService.verify(
        body.refreshToken,
        this.configService.getJwtConfig().refreshTokenSecret,
      );

      // Đưa cặp token cũ vào blacklist
      const accessTokenPayload = this.jwtService.decode(body.accessToken);
      const refreshTokenPayload = this.jwtService.decode(body.refreshToken);
      const accessTokenExpireIn =
        accessTokenPayload.exp - Math.ceil(Date.now() / 1000);
      const refreshTokenExpireIn =
        refreshTokenPayload.exp - Math.ceil(Date.now() / 1000);
      await this.redisClient
        .multi()
        .setEx(
          `TOKEN_BLACKLIST_${accessTokenPayload.jti}`,
          accessTokenExpireIn > 0 ? accessTokenExpireIn : 1,
          '1',
        )
        .setEx(
          `TOKEN_BLACKLIST_${refreshTokenPayload.jti}`,
          refreshTokenExpireIn > 0 ? refreshTokenExpireIn : 1,
          '1',
        )
        .exec();

      // Tạo cặp token mới
      const jwtPayload = this.jwtService.decode(body.refreshToken);
      return this.jwtService.generateToken({
        id: jwtPayload.id,
        role: jwtPayload.role,
        status: jwtPayload.status,
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }

  async signOut(body: SignOutReqDto) {
    // Đưa cặp token vào blacklist
    const accessTokenPayload = this.jwtService.decode(body.accessToken);
    const refreshTokenPayload = this.jwtService.decode(body.refreshToken);
    const accessTokenExpireIn =
      accessTokenPayload.exp - Math.ceil(Date.now() / 1000);
    const refreshTokenExpireIn =
      refreshTokenPayload.exp - Math.ceil(Date.now() / 1000);
    await this.redisClient
      .multi()
      .setEx(
        `TOKEN_BLACKLIST_${accessTokenPayload.jti}`,
        accessTokenExpireIn > 0 ? accessTokenExpireIn : 1,
        '1',
      )
      .setEx(
        `TOKEN_BLACKLIST_${refreshTokenPayload.jti}`,
        refreshTokenExpireIn > 0 ? refreshTokenExpireIn : 1,
        '1',
      )
      .exec();
    return null;
  }

  async verifyAccount(body: VerifyAccountReqDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: body.email,
      },
    });
    if (user) {
      if (body.otp === (await this.redisClient.get(`otp::${user.id}`))) {
        await this.userRepository.update(
          {
            id: user.id,
          },
          {
            status: UserStatus.ACTIVE,
          },
        );
        await this.redisClient.del(`otp::${user.id}`);
        return null;
      }
      throw new UnauthorizedException({
        error: 'OtpInvalid',
        message: 'The OTP code is incorrect',
      });
    }
    throw new NotFoundException({
      error: 'UserNotFound',
      message: 'User with this email does not exist',
    });
  }

  async sendOtp(body: SendOtpReqDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: body.email,
      },
    });
    if (user) {
      const otp = randomString.generate({
        length: 6,
        charset: 'numeric',
      });
      await this.redisClient.setEx(`otp::${user.id}`, 5 * 60, otp);
      await this.mailService.sendOtp(otp, user.email);
      return null;
    }
    throw new NotFoundException({
      error: 'UserNotFound',
      message: 'User with this email does not exist',
    });
  }

  async verifyForgotPassword(body: VerifyForgotPasswordReqDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: body.email,
      },
    });
    if (user) {
      if (body.otp === (await this.redisClient.get(`otp::${user.id}`))) {
        const code = randomString.generate({
          length: 32,
          charset: 'alphanumeric',
        });
        await this.redisClient
          .multi()
          .setEx(`reset-password::${user.id}`, 30 * 60, code)
          .del(`otp::${user.id}`)
          .exec();
        return {
          email: user.email,
          code,
        };
      }
      throw new UnauthorizedException({
        error: 'OtpInvalid',
        message: 'The OTP code is incorrect',
      });
    }
    throw new NotFoundException({
      error: 'UserNotFound',
      message: 'User with this email does not exist',
    });
  }

  async resetPassword(body: ResetPasswordReqDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: body.email,
      },
    });
    if (user) {
      if (
        body.code === (await this.redisClient.get(`reset-password::${user.id}`))
      ) {
        const updateResult = await this.userRepository.update(
          {
            id: user.id,
          },
          {
            passwordHash: await bcrypt.hash(body.password, 10),
          },
        );
        await this.redisClient.del(`reset-password::${user.id}`);
        return updateResult;
      }
      throw new ForbiddenException({
        error: 'CsrfTokenInvalid',
        message: 'Invalid or missing CSRF token',
      });
    }
    throw new NotFoundException({
      error: 'UserNotFound',
      message: 'User with this email does not exist',
    });
  }
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FavoriteRoom)
    private readonly favoriteRoomRepository: Repository<FavoriteRoom>,
    @InjectRepository(FavoriteService)
    private readonly favoriteServiceRepository: Repository<FavoriteService>,
    @InjectRepository(UserTier)
    private readonly userTierRepository: Repository<UserTier>,
  ) {}

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    return _.omit(user, 'passwordHash');
  }

  async updateProfile(userId: number, body: UpdateProfileReqDto) {
    try {
      const oldProfile = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });
      if (oldProfile.avatar) {
        const avatarPath = path.join(process.cwd(), oldProfile.avatar);
        await access(avatarPath);
        await unlink(avatarPath);
      }
    } catch (error) {
      console.log('Delete File Error::', error);
    }
    return await this.userRepository.update(
      {
        id: userId,
      },
      body,
    );
  }

  async getFavoriteRooms(userId: number, query: GetFavoriteRoomReqDto) {
    return this.favoriteRoomRepository
      .createQueryBuilder('favoriteRoom')
      .leftJoinAndSelect('favoriteRoom.room', 'room')
      .leftJoinAndSelect('room.media', 'media')
      .leftJoinAndSelect('room.type', 'type')
      .where('favoriteRoom.user_id = :userId', {
        userId,
      })
      .andWhere(
        new Brackets((qb) => {
          if (typeof query.roomId === 'number') {
            qb.where('favoriteRoom.room_id = :roomId', {
              roomId: query.roomId,
            });
          }
        }),
      )
      .orderBy('favoriteRoom.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
  }

  async createFavoriteRoom(userId: number, roomId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['favoriteRooms'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.favoriteRooms.some((fr) => fr.roomId === roomId)) {
      throw new ConflictException('Room is already in favorites');
    }

    const room = await this.userRepository.manager.findOne('Room', {
      where: {
        id: roomId,
      },
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return this.favoriteRoomRepository.save(
      this.favoriteRoomRepository.create({
        userId,
        roomId,
      }),
    );
  }

  async deleteFavoriteRoom(userId: number, favoriteRoomId: number) {
    const favoriteRoom = await this.favoriteRoomRepository.findOne({
      where: {
        id: favoriteRoomId,
        userId: userId,
      },
    });
    if (!favoriteRoom) {
      throw new NotFoundException('Favorite room not found');
    }

    return this.favoriteRoomRepository.delete({
      id: favoriteRoomId,
    });
  }

  async getFavoriteServices(userId: number, query: GetFavoriteServiceReqDto) {
    return this.favoriteServiceRepository
      .createQueryBuilder('favoriteService')
      .leftJoinAndSelect('favoriteService.service', 'service')
      .where('favoriteService.user_id = :userId', {
        userId,
      })
      .andWhere(
        new Brackets((qb) => {
          if (typeof query.serviceId === 'number') {
            qb.where('favoriteService.service_id = :serviceId', {
              serviceId: query.serviceId,
            });
          }
        }),
      )
      .orderBy('favoriteService.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
  }

  async createFavoriteService(userId: number, serviceId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['favoriteServices'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.favoriteServices.some((fs) => fs.serviceId === serviceId)) {
      throw new ConflictException('Service is already in favorites');
    }

    const service = await this.userRepository.manager.findOne('Service', {
      where: {
        id: serviceId,
      },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.favoriteServiceRepository.save(
      this.favoriteServiceRepository.create({
        userId,
        serviceId,
      }),
    );
  }

  async deleteFavoriteService(userId: number, favoriteServiceId: number) {
    const favoriteService = await this.favoriteServiceRepository.findOne({
      where: {
        id: favoriteServiceId,
        userId: userId,
      },
    });
    if (!favoriteService) {
      throw new NotFoundException('Favorite service not found');
    }

    return this.favoriteServiceRepository.delete({
      id: favoriteServiceId,
    });
  }

  async getTier(query: GetTierReqDto) {
    return this.userTierRepository
      .createQueryBuilder('userTier')
      .where(
        new Brackets((qb) => {
          if (typeof query.id === 'number') {
            qb.where('userTier.id = :id', {
              id: query.id,
            });
          }
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          if (typeof query.tierName === 'string') {
            qb.where('userTier.tierName = :tierName', {
              tierName: query.tierName,
            });
          }
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          if (typeof query.tierSlug === 'string') {
            qb.where('userTier.tierSlug = :tierSlug', {
              tierSlug: query.tierSlug,
            });
          }
        }),
      )
      .orderBy('userTier.tierOrder', 'ASC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
  }

  async createTier(body: CreateTierReqDto) {
    return this.userTierRepository.save(this.userTierRepository.create(body));
  }

  async updateTier(tierId: number, body: UpdateTierReqDto) {
    const tier = await this.userTierRepository.findOne({
      where: {
        id: tierId,
      },
    });
    if (!tier) {
      throw new NotFoundException('Tier not found');
    }
    return this.userTierRepository.update(
      {
        id: tierId,
      },
      body,
    );
  }

  async deleteTier(tierId: number) {
    const tier = await this.userTierRepository.findOne({
      where: {
        id: tierId,
      },
    });
    if (!tier) {
      throw new NotFoundException('Tier not found');
    }
    return this.userTierRepository.delete({
      id: tierId,
    });
  }
}
