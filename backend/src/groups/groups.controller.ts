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
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { SendMessageDto } from './dto/send-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateGroupDto) {
    return this.groupsService.create(user.id, dto);
  }

  @Get()
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.groupsService.listForUser(user.id);
  }

  @Get('public')
  listPublic(
    @CurrentUser() user: AuthenticatedUser,
    @Query('search') search?: string,
  ) {
    return this.groupsService.listPublic(user.id, search);
  }

  @Get('invite/:code')
  previewInvite(@Param('code') code: string) {
    return this.groupsService.previewInvite(code);
  }

  @Post('join')
  join(@CurrentUser() user: AuthenticatedUser, @Body() dto: JoinGroupDto) {
    return this.groupsService.join(user.id, dto.inviteCode);
  }

  @Get(':id')
  getDetail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.groupsService.getDetail(user.id, id);
  }

  @Get(':id/messages')
  listMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('after') after?: string,
  ) {
    return this.groupsService.listMessages(user.id, id, after);
  }

  @Post(':id/messages')
  sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.groupsService.sendMessage(user.id, id, dto.content);
  }

  @Post(':id/messages/read')
  markMessagesRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.groupsService.markMessagesRead(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groupsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.groupsService.remove(user.id, id);
  }

  @Post(':id/leave')
  leave(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.groupsService.leave(user.id, id);
  }

  @Delete(':id/members/:userId')
  kick(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return this.groupsService.kick(user.id, id, userId);
  }
}
