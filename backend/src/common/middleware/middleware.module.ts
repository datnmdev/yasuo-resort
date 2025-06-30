import { Module } from '@nestjs/common';
import { AuthorizationMiddleware } from './middleware.service';

@Module({
  providers: [AuthorizationMiddleware],
  exports: [AuthorizationMiddleware],
})
export class MiddlewareModule {}
