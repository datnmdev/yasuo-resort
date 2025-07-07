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

@Module({
  imports: [
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
    UserModule,
    RoomTypeModule,
    RoomModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(AuthorizationMiddleware)
        .forRoutes(
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
        )
  }
}
