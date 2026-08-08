import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { UpdateRoleDto } from './dto/update-role.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  metrics() {
    return this.adminService.getMetrics();
  }

  @Get('users')
  listUsers(
    @Query('search') search?: string,
    @Query('role') role?: 'admin' | 'user' | 'guest',
    @Query('status') status?: 'active' | 'blocked',
    @Query('page') page?: string,
  ) {
    return this.adminService.listUsers({
      search,
      role,
      status,
      page: page ? Number(page) : undefined,
    });
  }

  @Get('users/:id')
  getUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Patch('users/:id/block')
  blockUser(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.adminService.setBlocked(admin.id, id, true);
  }

  @Patch('users/:id/unblock')
  unblockUser(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.adminService.setBlocked(admin.id, id, false);
  }

  @Patch('users/:id/role')
  updateRole(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.adminService.setRole(admin.id, id, dto.role);
  }

  @Post('users/:id/reset-progress')
  resetProgress(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminService.resetProgress(id);
  }

  @Delete('users/:id')
  deleteUser(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.adminService.deleteUser(admin.id, id);
  }

  @Get('groups')
  listGroups(
    @Query('search') search?: string,
    @Query('type') type?: 'public' | 'private',
    @Query('page') page?: string,
  ) {
    return this.adminService.listGroups({
      search,
      type,
      page: page ? Number(page) : undefined,
    });
  }

  @Get('groups/:id')
  getGroup(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminService.getGroupDetail(id);
  }

  @Delete('groups/:id')
  deleteGroup(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminService.deleteGroup(id);
  }

  @Get('logs')
  listLogs(
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('endpoint') endpoint?: string,
    @Query('eventType') eventType?: string,
    @Query('statusCode') statusCode?: string,
    @Query('page') page?: string,
  ) {
    return this.adminService.listLogs({
      userId,
      from,
      to,
      endpoint,
      eventType,
      statusCode: statusCode ? Number(statusCode) : undefined,
      page: page ? Number(page) : undefined,
    });
  }

  @Get('errors')
  listErrors() {
    return this.adminService.listErrors();
  }

  @Get('errors/:id')
  getError(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.adminService.getError(id);
  }

  @Get('health')
  getHealth() {
    return this.adminService.getHealth();
  }

  @Get('health/history')
  getHealthHistory(@Query('hours') hours?: string) {
    return this.adminService.getHealthHistory(hours ? Number(hours) : 24);
  }

  @Get('health/requests-timeline')
  getRequestsTimeline(@Query('minutes') minutes?: string) {
    return this.adminService.getRequestsTimeline(minutes ? Number(minutes) : 60);
  }

  @Get('health/realtime')
  getRealtime() {
    return this.adminService.getRealtime();
  }

  @Get('alerts')
  listAlerts() {
    return this.adminService.listAlerts();
  }
}
