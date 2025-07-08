import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty } from "class-validator";

export class DeleteServiceReqDto {
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsInt()
  bookingId: number;

  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsInt()
  serviceId: number;
}