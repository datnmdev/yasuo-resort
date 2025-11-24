import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { OneOf } from 'common/decorators/validation.decorator';

export class PayDepositReqDto {
  @IsNotEmpty()
  @IsInt()
  bookingId: number;

  @IsNotEmpty()
  @IsString()
  @OneOf(['deposit_payment', 'final_payment'])
  paymentStage: 'deposit_payment' | 'final_payment';

  @IsNotEmpty()
  @IsString()
  @OneOf(['VNBANK'])
  bankCode: string;
}
