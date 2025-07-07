import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOtp(otp: string, to: string) {
    return this.mailerService.sendMail({
      to,
      from: 'no-reply@yasuo-resort.com',
      subject: 'Xác thực tài khoản',
      template: './otp',
      context: {
        otp,
      },
    });
  }
}
