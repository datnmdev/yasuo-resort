import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigModule } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigModule) {}

  getServerConfig() {
    return {
      baseUrl: this.nestConfigService.get('BASE_URL'),
    };
  }

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

  getRedisConfig() {
    return {
      host: this.nestConfigService.get('REDIS_HOST'),
      port: Number(this.nestConfigService.get('REDIS_PORT')),
      password: this.nestConfigService.get('REDIS_PASSWORD'),
    };
  }

  getMailerConfig() {
    return {
      host: this.nestConfigService.get('MAILER_HOST'),
      port: Number(this.nestConfigService.get('MAILER_PORT')),
      user: this.nestConfigService.get('MAILER_USER'),
      password: this.nestConfigService.get('MAILER_PASS'),
    };
  }

  getVnpConfig() {
    return {
      vnpTmnCode: this.nestConfigService.get('VNP_TMN_CODE'),
      vnpHashSecret: this.nestConfigService.get('VNP_HASH_SECRET'),
      vnpUrl: this.nestConfigService.get('VNP_URL'),
      vnpApi: this.nestConfigService.get('VNP_API'),
      vnpReturnUrl: this.nestConfigService.get('VNP_RETURN_URL'),
    };
  }
}
