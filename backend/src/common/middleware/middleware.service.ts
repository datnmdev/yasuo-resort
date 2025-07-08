import {
  ForbiddenException,
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '../jwt/jwt.service';
import { ConfigService } from '../config/config.service';
import { REDIS_CLIENT } from 'common/redis/redis.constants';
import { RedisClient } from 'common/redis/redis.type';
import { UserStatus } from 'common/constants/user.constants';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: RedisClient
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    try {
      const authorization = req.headers['authorization'];
      if (authorization?.startsWith('Bearer ')) {
        const accessToken = authorization.split('Bearer ')[1];
        const payload = this.jwtService.decode(accessToken);
        this.jwtService.verify(
          accessToken,
          this.configService.getJwtConfig().accessTokenSecret,
        );
        const isInTokenBlacklist = (await this.redisClient.get(`TOKEN_BLACKLIST_${payload.jti}`)) === null ? false : true
        if (isInTokenBlacklist) {
          return next(new UnauthorizedException('Unauthorized'));
        }
        if (payload.status === UserStatus.INACTIVE) {
          return next(new ForbiddenException({
            message: 'Account not activated yet',
            error: 'AccountNotActivated'
          }));
        } 
        req.user = payload;
        return next();
      }
      return next(new UnauthorizedException('Unauthorized'));
    } catch (error) {
      return next(new UnauthorizedException('Unauthorized'));
    }
  }
}
