import { IsInt, IsNotEmpty } from "class-validator";

export class ClaimVoucherReqDto {
  @IsNotEmpty()
  @IsInt()
  id: number;
}