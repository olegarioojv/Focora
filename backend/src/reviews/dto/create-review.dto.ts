import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  subjectId: string;

  @IsString()
  sourceTaskId: string;

  @IsInt()
  intervalDays: number;

  @IsString()
  dueDate: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  durationMinutes?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
