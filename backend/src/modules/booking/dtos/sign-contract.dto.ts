import { IsNotEmpty, IsString } from 'class-validator';

export class SignContractReqDto {
  @IsNotEmpty()
  @IsString()
  signatureUrl: string;
}
