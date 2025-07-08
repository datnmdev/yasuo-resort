import { IsArray, IsDateString, IsInt, IsNotEmpty } from 'class-validator';

class ServiceDto {
  @IsNotEmpty()
  @IsInt()
  serviceId: number;

  @IsNotEmpty()
  quantity: number | null = null;
}

export class BookingRoomReqDto {
  @IsNotEmpty()
  @IsInt()
  roomId: number;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsNotEmpty()
  @IsArray()
  services: ServiceDto[] = [];
}
