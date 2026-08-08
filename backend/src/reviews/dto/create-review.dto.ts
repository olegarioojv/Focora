import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

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
  @IsBoolean()
  completed?: boolean;
}
