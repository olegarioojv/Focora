import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { AwardPomodoroDto, AwardReviewDto, AwardTaskDto } from './dto/award.dto';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  find(@CurrentUser() user: AuthenticatedUser) {
    return this.settingsService.findOrCreate(user.id);
  }

  @Get('daily-logs')
  listDailyLogs(@CurrentUser() user: AuthenticatedUser) {
    return this.settingsService.listDailyLogs(user.id);
  }

  @Get('ranking')
  ranking() {
    return this.settingsService.getRanking();
  }

  @Patch()
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.settingsService.update(user.id, dto);
  }

  @Post('award-pomodoro')
  awardPomodoro(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AwardPomodoroDto,
  ) {
    return this.settingsService.awardPomodoro(user.id, dto.durationMinutes);
  }

  @Post('award-task')
  awardTask(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AwardTaskDto,
  ) {
    return this.settingsService.awardTask(user.id, dto.taskId);
  }

  @Post('award-review')
  awardReview(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AwardReviewDto,
  ) {
    return this.settingsService.awardReview(user.id, dto.reviewId);
  }
}
