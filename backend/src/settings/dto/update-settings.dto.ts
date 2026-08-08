import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsIn(['light', 'dark'])
  theme?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(180)
  defaultDurationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  defaultBreakMinutes?: number;

  @IsOptional()
  @IsBoolean()
  notifyOnComplete?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  dailyGoalPomodoros?: number;
}
