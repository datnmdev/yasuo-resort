import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { AuthController } from "./user.controller";
import { AuthService } from "./user.service";
import { MailModule } from "common/mail/mail.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ]),
    MailModule
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService
  ],
  exports: []
})
export class UserModule {}