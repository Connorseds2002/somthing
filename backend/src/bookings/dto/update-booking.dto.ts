import { IsString, IsISO8601, IsOptional } from 'class-validator';

export class UpdateBookingDto {
  @IsString()
  @IsOptional()
  position?: string;

  @IsISO8601()
  @IsOptional()
  startTime?: string;

  @IsISO8601()
  @IsOptional()
  endTime?: string;
}
