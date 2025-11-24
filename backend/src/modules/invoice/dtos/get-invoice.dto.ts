import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class GetInvoiceReqDto {
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsInt()
  bookingId: number;
}
