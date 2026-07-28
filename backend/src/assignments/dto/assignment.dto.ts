import { IsArray, IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignmentItemDto {
  @IsString()
  clientId: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreateAssignmentDto {
  @IsString()
  employeeId: string;

  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentItemDto)
  clients: AssignmentItemDto[];
}

export class RemoveAssignmentDto {
  @IsString()
  assignmentId: string;
}

export class CreateRouteTemplateDto {
  @IsString()
  employeeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentItemDto)
  clients: AssignmentItemDto[];

  @IsArray()
  @IsNumber({}, { each: true })
  daysOfWeek: number[];

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
