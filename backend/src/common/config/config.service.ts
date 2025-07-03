import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigModule } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigModule) {}

  getJwtConfig() {
    return {
      accessTokenSecret: this.nestConfigService.get('JWT_ACCESSTOKEN_SECRET'),
      refreshTokenSecret: this.nestConfigService.get('JWT_REFRESHTOKEN_SECRET'),
    };
  }

  getDatabaseConfig() {
    return {
      type: 'mysql',
      host: this.nestConfigService.get('DB_HOST'),
      port: Number(this.nestConfigService.get('DB_PORT')),
      username: this.nestConfigService.get('DB_USER'),
      password: this.nestConfigService.get('DB_PASS'),
      database: this.nestConfigService.get('DB_NAME'),
      entities: ['dist/**/entities/*.{ts,js}'],
      synchronize: false,
    };
  }
}
