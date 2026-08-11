import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

const ONLINE_WINDOW_MS = 5 * 60 * 1000;
const MESSAGE_PAGE_SIZE = 50;
const INVITE_CODE_LENGTH = 8;
// Excludes visually ambiguous characters (0/O, 1/I/L) — these codes get
// typed by hand when sharing outside the app link/QR flow.
const INVITE_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateInviteCode() {
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_ALPHABET[randomInt(INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

function daysAgoDateString(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function hasUnread(latestMessageAt: Date | undefined, lastReadAt: Date | null) {
  if (!latestMessageAt) return false;
  if (!lastReadAt) return true;
  return latestMessageAt.getTime() > lastReadAt.getTime();
}

function mapGroupMessage(message: {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  createdAt: Date;
  user: { id: string; name: string; avatarUrl: string | null };
}) {
  return {
    id: message.id,
    groupId: message.groupId,
    userId: message.userId,
    userName: message.user.name,
    userAvatarUrl: message.user.avatarUrl,
    content: message.content,
    createdAt: message.createdAt,
  };
}

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateGroupDto) {
    const inviteCode = await this.generateUniqueInviteCode();

    const created = await this.prisma.group.create({
      data: {
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        type: dto.type,
        maxMembers: dto.maxMembers,
        inviteCode,
        ownerId: userId,
        members: { create: { userId } },
      },
    });

    // Returns the same shape as getDetail() (members, isOnline, etc.)
    // instead of the bare Prisma row — the frontend renders this response
    // straight into the member grid, so it needs the full detail shape.
    return this.getDetail(userId, created.id);
  }

  async listForUser(userId: string) {
    const memberships = await this.prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: { include: { _count: { select: { members: true } } } },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const groupIds = memberships.map((membership) => membership.groupId);
    const latestByGroup = await this.getLatestMessageTimeByGroup(groupIds);

    return memberships.map(({ group, lastReadAt }) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      icon: group.icon,
      type: group.type,
      maxMembers: group.maxMembers,
      memberCount: group._count.members,
      isOwner: group.ownerId === userId,
      hasUnreadMessages: hasUnread(latestByGroup.get(group.id), lastReadAt),
    }));
  }

  private async getLatestMessageTimeByGroup(groupIds: string[]) {
    if (groupIds.length === 0) return new Map<string, Date>();
    const latest = await this.prisma.groupMessage.groupBy({
      by: ['groupId'],
      where: { groupId: { in: groupIds } },
      _max: { createdAt: true },
    });
    return new Map(
      latest
        .filter((row) => row._max.createdAt)
        .map((row) => [row.groupId, row._max.createdAt as Date]),
    );
  }

  async listPublic(userId: string, search?: string) {
    const groups = await this.prisma.group.findMany({
      where: {
        type: 'public',
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      include: {
        _count: { select: { members: true } },
        members: { where: { userId }, select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      icon: group.icon,
      maxMembers: group.maxMembers,
      memberCount: group._count.members,
      isMember: group.members.length > 0,
      // Public groups aren't secret — anyone can already see this group in
      // the browse list, so exposing its code here just lets the frontend
      // reuse the same join(inviteCode) flow instead of a second endpoint.
      inviteCode: group.inviteCode,
    }));
  }

  async getDetail(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: { user: { include: { settings: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
    if (!group) throw new NotFoundException('Grupo não encontrado');

    const isMember = group.members.some((member) => member.userId === userId);
    if (!isMember)
      throw new ForbiddenException('Você não participa deste grupo');

    const memberIds = group.members.map((member) => member.userId);
    const since = daysAgoDateString(6);
    const dailyLogs = await this.prisma.dailyLog.findMany({
      where: { userId: { in: memberIds }, date: { gte: since } },
      select: { userId: true, minutes: true },
    });
    const allDailyLogCounts = await this.prisma.dailyLog.groupBy({
      by: ['userId'],
      where: { userId: { in: memberIds } },
      _count: { _all: true },
    });

    const weeklyMinutesByUser = new Map<string, number>();
    for (const log of dailyLogs) {
      weeklyMinutesByUser.set(
        log.userId,
        (weeklyMinutesByUser.get(log.userId) ?? 0) + log.minutes,
      );
    }
    const daysCompletedByUser = new Map(
      allDailyLogCounts.map((row) => [row.userId, row._count._all]),
    );

    const now = Date.now();
    const members = group.members.map((member) => ({
      userId: member.userId,
      name: member.user.name,
      avatarUrl: member.user.avatarUrl,
      xp: member.user.settings?.xp ?? 0,
      currentStreak: member.user.settings?.currentStreak ?? 0,
      weeklyMinutes: weeklyMinutesByUser.get(member.userId) ?? 0,
      daysCompleted: daysCompletedByUser.get(member.userId) ?? 0,
      isOnline: member.user.lastLoginAt
        ? now - member.user.lastLoginAt.getTime() < ONLINE_WINDOW_MS
        : false,
      isOwner: member.userId === group.ownerId,
      joinedAt: member.joinedAt,
    }));

    const myMembership = group.members.find(
      (member) => member.userId === userId,
    );
    const latestMessage = await this.prisma.groupMessage.findFirst({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      icon: group.icon,
      type: group.type,
      maxMembers: group.maxMembers,
      inviteCode: group.inviteCode,
      isOwner: group.ownerId === userId,
      members,
      hasUnreadMessages: hasUnread(
        latestMessage?.createdAt,
        myMembership?.lastReadAt ?? null,
      ),
    };
  }

  // Ascending (oldest first) — either the initial page (last 50 messages)
  // or, when `after` is set, everything newer than that timestamp for the
  // frontend's chat poll to append.
  async listMessages(userId: string, groupId: string, after?: string) {
    await this.assertMember(userId, groupId);

    if (after) {
      const messages = await this.prisma.groupMessage.findMany({
        where: { groupId, createdAt: { gt: new Date(after) } },
        orderBy: { createdAt: 'asc' },
        take: MESSAGE_PAGE_SIZE,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      });
      return messages.map(mapGroupMessage);
    }

    const messages = await this.prisma.groupMessage.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
      take: MESSAGE_PAGE_SIZE,
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
    return messages.reverse().map(mapGroupMessage);
  }

  async sendMessage(userId: string, groupId: string, content: string) {
    await this.assertMember(userId, groupId);
    const message = await this.prisma.groupMessage.create({
      data: { groupId, userId, content: content.trim() },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
    return mapGroupMessage(message);
  }

  async markMessagesRead(userId: string, groupId: string) {
    await this.assertMember(userId, groupId);
    await this.prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId } },
      data: { lastReadAt: new Date() },
    });
    return { success: true };
  }

  private async assertMember(userId: string, groupId: string) {
    const membership = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!membership)
      throw new ForbiddenException('Você não participa deste grupo');
  }

  async update(userId: string, groupId: string, dto: UpdateGroupDto) {
    await this.assertOwner(userId, groupId);
    return this.prisma.group.update({ where: { id: groupId }, data: dto });
  }

  async remove(userId: string, groupId: string) {
    await this.assertOwner(userId, groupId);
    await this.prisma.group.delete({ where: { id: groupId } });
  }

  async leave(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) throw new NotFoundException('Grupo não encontrado');
    if (group.ownerId === userId) {
      throw new ForbiddenException(
        'O administrador não pode sair do grupo — apague o grupo se quiser encerrá-lo',
      );
    }

    const membership = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!membership)
      throw new NotFoundException('Você não participa deste grupo');

    await this.prisma.groupMember.delete({ where: { id: membership.id } });
  }

  async kick(userId: string, groupId: string, targetUserId: string) {
    await this.assertOwner(userId, groupId);
    if (targetUserId === userId) {
      throw new ForbiddenException(
        'O administrador não pode remover a si mesmo — apague o grupo se quiser encerrá-lo',
      );
    }

    const membership = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });
    if (!membership) throw new NotFoundException('Membro não encontrado');

    await this.prisma.groupMember.delete({ where: { id: membership.id } });
  }

  async previewInvite(code: string) {
    const group = await this.prisma.group.findUnique({
      where: { inviteCode: code.toUpperCase() },
      include: { _count: { select: { members: true } } },
    });
    if (!group) throw new NotFoundException('Convite inválido ou expirado');

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      icon: group.icon,
      memberCount: group._count.members,
      maxMembers: group.maxMembers,
    };
  }

  async join(userId: string, inviteCode: string) {
    const group = await this.prisma.group.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
      select: { id: true },
    });
    if (!group) throw new NotFoundException('Convite inválido ou expirado');

    // The capacity check and the member insert must be atomic — otherwise
    // two joins racing for the last slot can both pass the check before
    // either commits (confirmed reproducible: 3 of 5 concurrent joins
    // against a 1-slot-free group all succeeded). `SELECT ... FOR UPDATE`
    // on the group row serializes concurrent joiners of the same group so
    // the count each one sees is always up to date.
    return this.prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<{ id: string; maxMembers: number }[]>`
        SELECT id, "maxMembers" FROM groups WHERE id = ${group.id} FOR UPDATE
      `;
      if (locked.length === 0) {
        throw new NotFoundException('Convite inválido ou expirado');
      }
      const { maxMembers } = locked[0];

      const existing = await tx.groupMember.findUnique({
        where: { groupId_userId: { groupId: group.id, userId } },
      });
      if (existing)
        throw new ConflictException('Você já participa deste grupo');

      const memberCount = await tx.groupMember.count({
        where: { groupId: group.id },
      });
      if (memberCount >= maxMembers) {
        throw new ConflictException(
          'Este grupo já atingiu o número máximo de participantes',
        );
      }

      await tx.groupMember.create({ data: { groupId: group.id, userId } });

      return { id: group.id };
    });
  }

  private async assertOwner(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) throw new NotFoundException('Grupo não encontrado');
    if (group.ownerId !== userId) {
      throw new ForbiddenException(
        'Apenas o administrador do grupo pode fazer isso',
      );
    }
    return group;
  }

  private async generateUniqueInviteCode() {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateInviteCode();
      const existing = await this.prisma.group.findUnique({
        where: { inviteCode: code },
        select: { id: true },
      });
      if (!existing) return code;
    }
    throw new ConflictException(
      'Não foi possível gerar um código de convite, tente novamente',
    );
  }
}
