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

  async signContractNotify(to: string, data: any) {
    return this.mailerService.sendMail({
      to,
      from: 'no-reply@yasuo-resort.com',
      subject: 'A new contract is waiting for you to sign from YasuoResort',
      template: './sign-contract',
      context: {
        data,
      },
    });
  }

  async paySuccessNotify(to: string, data: any) {
    return this.mailerService.sendMail({
      to,
      from: 'no-reply@yasuo-resort.com',
      subject: 'You have successfully completed a transaction on YasuoResort',
      template: './pay-success',
      context: {
        data,
      },
    });
  }

  async invoiceNotify(to: string, url: string) {
    return this.mailerService.sendMail({
      to,
      from: 'no-reply@yasuo-resort.com',
      subject: 'You have a new invoice sent from YasuoResort',
      template: './invoice-notify',
      context: {
        url,
      },
    });
  }

  async bookingRejectNotify(to: string, data: any) {
    return this.mailerService.sendMail({
      to,
      from: 'no-reply@yasuo-resort.com',
      subject:
        'A room that you booked has been canceled by the administrator from YasuoResort',
      template: './reject-booking',
      context: {
        data,
      },
    });
  }

  async voucherReleasedNotify(to: string, data: any) {
    return this.mailerService.sendMail({
      to,
      from: 'no-reply@yasuo-resort.com',
      subject:
        'A voucher has just been issued on YasuoResort — grab it quickly before it’s gone!',
      template: './voucher-release',
      context: {
        data,
      },
    });
  }
}
