import { Controller, Post, UploadedFile } from "@nestjs/common";
import { FileUploadInterceptor } from "common/interceptors/file-upload.interceptor";

@Controller('upload')
export class UploadController {
  @Post()
  @FileUploadInterceptor('file')
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      path: file.path,
    };
  }
}