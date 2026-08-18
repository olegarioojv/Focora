import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';
import { DayPlanService } from './day-plan.service';
import { UpsertDayPlanDto } from './dto/upsert-day-plan.dto';
import { SyncDayPlanDto } from './dto/sync-day-plan.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ReorderSessionsDto } from './dto/reorder-sessions.dto';
import { CATEGORIES, WEEKDAYS } from './day-plan.constants';

@UseGuards(JwtAuthGuard)
@Controller('day-plan')
export class DayPlanController {
  constructor(private readonly dayPlanService: DayPlanService) {}

  @Get('configs')
  findConfigs(@CurrentUser() user: AuthenticatedUser) {
    return this.dayPlanService.findAllConfigs(user.id);
  }

  @Put('configs/:weekday/:category')
  upsertConfig(
    @CurrentUser() user: AuthenticatedUser,
    @Param('weekday') weekday: string,
    @Param('category') category: string,
    @Body() dto: UpsertDayPlanDto,
  ) {
    if (!WEEKDAYS.includes(weekday)) {
      throw new BadRequestException('Dia da semana inválido');
    }
    if (!CATEGORIES.includes(category)) {
      throw new BadRequestException('Categoria inválida');
    }
    return this.dayPlanService.upsertConfig(user.id, weekday, category, dto);
  }

  @Get('sessions')
  findSessions(
    @CurrentUser() user: AuthenticatedUser,
    @Query('weekStart') weekStart: string,
  ) {
    return this.dayPlanService.findSessions(user.id, weekStart);
  }

  @Get('sessions/by-date')
  findSessionsByDate(
    @CurrentUser() user: AuthenticatedUser,
    @Query('date') date: string,
  ) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('Data inválida');
    }
    return this.dayPlanService.findCompletedSessionsByDate(user.id, date);
  }

  @Post('sync')
  sync(@CurrentUser() user: AuthenticatedUser, @Body() dto: SyncDayPlanDto) {
    return this.dayPlanService.syncCurrentWeek(user.id, dto.weekStart);
  }

  @Post('sessions')
  createSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSessionDto,
  ) {
    return this.dayPlanService.createSession(user.id, dto);
  }

  @Patch('sessions/:id')
  updateSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.dayPlanService.toggleCompleted(user.id, id, dto.completed);
  }

  @Delete('sessions/:id')
  removeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.dayPlanService.removeSession(user.id, id);
  }

  @Put('sessions/reorder')
  reorder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReorderSessionsDto,
  ) {
    return this.dayPlanService.reorder(user.id, dto);
  }
}
