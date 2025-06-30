import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      isSucess: false,
      data: null,
      error:
        typeof exception.getResponse() === 'object'
          ? {
              code: (exception.getResponse() as any).error,
              message: (exception.getResponse() as any).message,
            }
          : {
              code: null,
              message: exception.getResponse(),
            },
    });
  }
}
