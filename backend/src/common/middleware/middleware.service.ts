import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from '../jwt/jwt.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authorization = req.headers['authorization'];
      if (authorization?.startsWith('Bearer ')) {
        const accessToken = authorization.split('Bearer ')[1];
        const payload = this.jwtService.decode(accessToken);
        this.jwtService.verify(
          accessToken,
          this.configService.getJwtConfig().accessTokenSecret,
        );
        req.user = payload;
        return next();
      }
      return next(new UnauthorizedException());
    } catch (error) {
      return next(new UnauthorizedException());
    }
  }
}
