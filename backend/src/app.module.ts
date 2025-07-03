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
    JwtModule,
    MiddlewareModule,
    GuardModule,
    UserModule,
    RoomTypeModule
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
          }
        )
  }
}
