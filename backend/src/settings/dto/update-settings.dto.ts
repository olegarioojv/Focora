import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

// Kept in sync by hand with SOUND_LIBRARY in frontend/src/utils/pomodoro-sounds.ts
// (same pattern already used for theme: 'light' | 'dark' duplicated on both sides).
const POMODORO_SOUND_KEYS = [
  'classico',
  'digital',
  'campainha',
  'sino',
  'suave',
  'minimalista',
  'foco',
  'natureza',
];

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

  @IsOptional()
  @IsBoolean()
  pomodoroSoundsEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  pomodoroSoundVolume?: number;

  @IsOptional()
  @IsIn(POMODORO_SOUND_KEYS)
  pomodoroFocusStartSound?: string;

  @IsOptional()
  @IsIn(POMODORO_SOUND_KEYS)
  pomodoroFocusEndSound?: string;

  @IsOptional()
  @IsIn(POMODORO_SOUND_KEYS)
  pomodoroBreakStartSound?: string;

  @IsOptional()
  @IsIn(POMODORO_SOUND_KEYS)
  pomodoroBreakEndSound?: string;
}
