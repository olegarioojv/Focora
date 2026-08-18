import { Module } from '@nestjs/common';
import { DayPlanService } from './day-plan.service';
import { DayPlanController } from './day-plan.controller';

@Module({
  controllers: [DayPlanController],
  providers: [DayPlanService],
})
export class DayPlanModule {}
