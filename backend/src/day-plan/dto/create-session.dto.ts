import { IsIn, IsInt, IsString, Min } from 'class-validator';
import { CATEGORIES, WEEKDAYS } from '../day-plan.constants';

export class CreateSessionDto {
  @IsString()
  subjectId: string;

  @IsIn(CATEGORIES)
  category: string;

  @IsIn(WEEKDAYS)
  weekday: string;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsString()
  weekStart: string;
}
