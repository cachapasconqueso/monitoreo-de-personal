import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckInVisitDto {
  @IsString()
  clientId: string;

  @IsString()
  @IsOptional()
  assignmentId?: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng?: number;
}

export class CheckOutVisitDto {
  @IsString()
  visitId: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng?: number;
}
