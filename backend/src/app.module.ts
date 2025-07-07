import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from './common/config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from './common/config/config.service';
import { JwtModule } from './common/jwt/jwt.module';
import { MiddlewareModule } from './common/middleware/middleware.module';
import { GuardModule } from './common/guards/guard.module';
import { UserModule } from 'modules/user/user.module';
import { RoomTypeModule } from 'modules/room-type/room-type.module';
import { AuthorizationMiddleware } from 'common/middleware/middleware.service';
import { RoomModule } from 'modules/room/room.module';
import { RedisModule } from 'common/redis/redis.module';
import { MailModule } from 'common/mail/mail.module';
import { UploadModule } from 'modules/upload/upload.module';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ServiceModule } from 'modules/service/service.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'uploads'),
      serveRoot: '/api/v1/uploads',
    }),
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getDatabaseConfig().host,
        port: Number(configService.getDatabaseConfig().port),
        username: configService.getDatabaseConfig().username,
        password: configService.getDatabaseConfig().password,
        database: configService.getDatabaseConfig().database,
        entities: configService.getDatabaseConfig().entities,
        synchronize: configService.getDatabaseConfig().synchronize,
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRoot({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    }),
    MailModule,
    JwtModule,
    MiddlewareModule,
    GuardModule,
    UploadModule,
    UserModule,
    RoomTypeModule,
    RoomModule,
    ServiceModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(AuthorizationMiddleware)
        .forRoutes(
          'user',
          {
            path: 'room-type',
            method: RequestMethod.POST
          },
          {
            path: 'room-type/:roomTypeId',
            method: RequestMethod.PUT
          },
          {
            path: 'room-type/:roomTypeId',
            method: RequestMethod.DELETE
          },
          {
            path: 'room',
            method: RequestMethod.POST
          },
          {
            path: 'room/:roomId',
            method: RequestMethod.PUT
          },
          {
            path: 'room/:roomId',
            method: RequestMethod.DELETE
          },
          {
            path: 'service',
            method: RequestMethod.POST
          },
          {
            path: 'service/:serviceId',
            method: RequestMethod.PUT
          },
          {
            path: 'service/:serviceId',
            method: RequestMethod.DELETE
          },
        )
  }
}
