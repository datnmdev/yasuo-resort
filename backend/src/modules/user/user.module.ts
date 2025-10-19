import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { AuthController, UserController } from "./user.controller";
import { AuthService, UserService } from "./user.service";
import { MailModule } from "common/mail/mail.module";
import { FavoriteRoom } from "./entities/favorite-room.entity";
import { FavoriteService } from "./entities/favorite-service.entity";
import { UserTier } from "./entities/user-tier.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      FavoriteRoom,
      FavoriteService,
      UserTier
    ]),
    MailModule
  ],
  controllers: [
    AuthController,
    UserController
  ],
  providers: [
    AuthService,
    UserService
  ],
  exports: []
})
export class UserModule {}