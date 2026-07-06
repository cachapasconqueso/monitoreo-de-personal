import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CheckInDto {
  @IsDateString()
  @IsOptional()
  timestamp?: string;
}

export class CheckOutDto {
  @IsDateString()
  @IsOptional()
  timestamp?: string;
}

export class LunchStartDto {
  @IsDateString()
  @IsOptional()
  timestamp?: string;
}

export class LunchEndDto {
  @IsDateString()
  @IsOptional()
  timestamp?: string;
}

export class UpdateAttendanceDto {
  @IsString()
  @IsOptional()
  notes?: string;
}
