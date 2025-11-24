import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class GetReceiptsReqDto {
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsInt()
  bookingId: number;
}
