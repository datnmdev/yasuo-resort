import { IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";
import { OneOf } from "common/decorators/validation.decorator";

export class CreateFeedbackReqDto {
  @IsNotEmpty()
  @IsInt()
  bookingId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsNotEmpty()
  @IsString()
  @OneOf(['room', 'service', 'combo'])
  targetType: 'room' | 'service' | 'combo';

  @IsNotEmpty()
  @IsInt()
  targetId: number;
}