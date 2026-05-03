import { IsString, IsISO8601, IsNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  vid!: string;

  @IsString()
  @IsNotEmpty()
  callsign!: string;

  @IsString()
  @IsNotEmpty()
  position!: string;

  @IsISO8601()
  @IsNotEmpty()
  startTime!: string;

  @IsISO8601()
  @IsNotEmpty()
  endTime!: string;
}
