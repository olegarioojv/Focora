import { IsInt, IsString, Max, Min } from 'class-validator';

export class AwardTaskDto {
  @IsString()
  taskId: string;
}

export class AwardReviewDto {
  @IsString()
  reviewId: string;
}

export class AwardPomodoroDto {
  @IsInt()
  @Min(1)
  @Max(180)
  durationMinutes: number;
}
