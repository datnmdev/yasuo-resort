import { IsInt, IsNotEmpty } from "class-validator";

export class CreateFavoriteRoomReqDto {
  @IsNotEmpty()
  @IsInt()
  roomId: number;
}