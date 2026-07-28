import { ArrayNotEmpty, IsArray, IsInt, IsString, Matches, Max, Min } from 'class-validator';

export class CreateWorkScheduleDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek: number[];

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime debe tener formato HH:mm' })
  startTime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime debe tener formato HH:mm' })
  endTime: string;
}
