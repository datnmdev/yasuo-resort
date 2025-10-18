import { IsInt, IsNotEmpty } from "class-validator";

export class CreateFavoriteServiceReqDto {
  @IsNotEmpty()
  @IsInt()
  serviceId: number;
}