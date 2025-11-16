import { IsInt, IsNotEmpty } from 'class-validator';
import { OneOf } from 'common/decorators/validation.decorator';

export class PublicationComboReqDto {
  @IsNotEmpty()
  @IsInt()
  @OneOf([0, 1])
  isActive: number;
}
