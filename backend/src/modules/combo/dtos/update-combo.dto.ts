import { IsOptional, IsString } from 'class-validator';

export class UpdateComboReqDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}
