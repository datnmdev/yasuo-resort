import { HttpStatus } from "@nestjs/common";

export class AppResponse {
  public statusCode: number;
  public isSuccess: boolean;
  public data: any;
  public error: any;

  constructor(statusCode: number, isSuccess: boolean, data: any, error: any) {
    this.statusCode = statusCode;
    this.isSuccess = isSuccess;
    this.data = data;
    this.error = error;
  }

  static ok(data: any) {
    return new AppResponse(HttpStatus.OK, true, data, null);
  }

  static error(statusCode: number, error: any) {
    return new AppResponse(statusCode, false, null, error);
  }
}