import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class DayPlanEntryDto {
  @IsString()
  subjectId: string;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsInt()
  @Min(1)
  repetitions: number;
}

export class UpsertDayPlanDto {
  @IsInt()
  @Min(0)
  subjectCount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayPlanEntryDto)
  entries: DayPlanEntryDto[];
}
