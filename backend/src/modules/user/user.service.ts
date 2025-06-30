import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { SignUpReqDto } from "./dtos/sign-up.dto";
import { Role } from "common/constants/user.constants";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async signUp(body: SignUpReqDto) {
    // Kiểm tra số điện thoại đã được đăng ký với tài khoản nào hay chưa
    const user = await this.userRepository.findOne({
      where: {
        phone: body.phone
      }
    })
    if (user) {
      throw new ConflictException('Account already exists');
    }

    // Tạo tài khoản mới
    const userEntity = this.userRepository.create({
      name: body.name,
      phone: body.phone,
      gender: body.gender,
      dob: body.dob,
      role: Role.USER,
      passwordHash: await bcrypt.hash(body.password, 10)
    });
    return this.userRepository.save(userEntity);
  }
}