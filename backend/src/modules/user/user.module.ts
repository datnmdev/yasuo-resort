import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { AuthController, UserController } from "./user.controller";
import { AuthService, UserService } from "./user.service";
import { MailModule } from "common/mail/mail.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
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