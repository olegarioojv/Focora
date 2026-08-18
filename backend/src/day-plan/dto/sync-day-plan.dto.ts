import { IsString } from 'class-validator';

export class SyncDayPlanDto {
  @IsString()
  weekStart: string;
}
