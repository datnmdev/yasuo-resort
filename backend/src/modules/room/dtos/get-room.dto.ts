import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { RoomCurrentCondition, RoomStatus } from "common/constants/room.constants";
import { JsonToObject } from "common/decorators/transform.decorator";
import { ArrayElementsIn } from "common/decorators/validation.decorator";

export class GetRoomsReqDto {
  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsInt()
  typeId: number;

  @IsOptional()
  @JsonToObject()
  @ArrayElementsIn([
    RoomStatus.ACTIVE,
    RoomStatus.INACTIVE,
    RoomStatus.UNDER_MAINTENANCE,
    RoomStatus.RETIRED 
  ])
  status: string[]

  @IsOptional()
  @JsonToObject()
  @ArrayElementsIn([
    RoomCurrentCondition.AVAILABLE,
    RoomCurrentCondition.BOOKED
  ])
  currentCondition: string[]

  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  page: number;

  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  limit: number;
}