import { IsArray, IsCurrency, IsDateString, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { OneOf } from 'common/decorators/validation.decorator';

export class CreateVoucherReqDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  @OneOf(['percentage', 'fixed_amount'])
  discountType: 'percentage' | 'fixed_amount';

  @IsNotEmpty()
  @IsCurrency()
  discountValue: string;

  @IsNotEmpty()   
  @IsCurrency()
  maxDiscountAmount: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  claimLimit: number;

  @IsNotEmpty() 
  @IsCurrency()
  minBookingAmount: string;

  @IsNotEmpty()
  @IsArray()
  @IsInt({ each: true })
  userTierIds: number[];
}
