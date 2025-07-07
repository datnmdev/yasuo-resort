import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import * as path from 'path';
import { MailService } from './mail.service';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.getMailerConfig().host,
          port: configService.getMailerConfig().port,
          secure: true,
          auth: {
            user: configService.getMailerConfig().user,
            pass: configService.getMailerConfig().password,
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@storyhub.com>',
        },
        template: {
          dir: path.join(process.cwd(), 'src/assets/templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
