import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { AuthController } from "./user.controller";
import { AuthService } from "./user.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ])
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