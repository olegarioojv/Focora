import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { parseUserAgent } from '../common/utils/user-agent';
import { ProcessMetricsService } from '../common/services/process-metrics.service';
import { DatabaseHealthService } from '../common/services/database-health.service';

const PAGE_SIZE = 20;
const LOG_PAGE_SIZE = 50;

interface ListUsersParams {
  search?: string;
  role?: 'admin' | 'user' | 'guest';
  status?: 'active' | 'blocked';
  page?: number;
}

interface ListGroupsParams {
  search?: string;
  type?: 'public' | 'private';
  page?: number;
}

interface ListLogsParams {
  userId?: string;
  from?: string;
  to?: string;
  endpoint?: string;
  eventType?: string;
  statusCode?: number;
  page?: number;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly processMetrics: ProcessMetricsService,
    private readonly databaseHealth: DatabaseHealthService,
  ) {}

  async getMetrics() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [
      totalUsers,
      activeToday,
      newToday,
      guestUsers,
      settingsAgg,
      totalDaysCompleted,
      database,
      responseAgg,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { lastLoginAt: { gte: startOfToday } },
      }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.user.count({ where: { isGuest: true } }),
      this.prisma.settings.aggregate({
        _sum: { totalFocusMinutes: true },
        _avg: { currentStreak: true },
      }),
      this.prisma.dailyLog.count(),
      this.databaseHealth.check(),
      this.prisma.requestLog.aggregate({
        where: { createdAt: { gte: oneHourAgo } },
        _avg: { durationMs: true },
        _count: true,
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        activeToday,
        newToday,
        guests: guestUsers,
      },
      totalHoursStudied:
        Math.round(((settingsAgg._sum.totalFocusMinutes ?? 0) / 60) * 10) / 10,
      totalDaysCompleted,
      averageStreak: Math.round((settingsAgg._avg.currentStreak ?? 0) * 10) / 10,
      api: {
        status: 'online',
        averageResponseMs: Math.round(responseAgg._avg.durationMs ?? 0),
        requestsLastHour: responseAgg._count,
      },
      database,
      process: {
        memory: this.processMetrics.getMemoryUsage(),
        cpuPercent: this.processMetrics.getCpuPercent(),
      },
    };
  }

  async listUsers(params: ListUsersParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const where: Prisma.UserWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.role === 'admin') where.role = 'admin';
    else if (params.role === 'guest') where.isGuest = true;
    else if (params.role === 'user') {
      where.role = 'user';
      where.isGuest = false;
    }
    if (params.status === 'blocked') where.blocked = true;
    else if (params.status === 'active') where.blocked = false;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
          lastLoginAt: true,
          isGuest: true,
          role: true,
          blocked: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, pageSize: PAGE_SIZE };
  }

  async getUserDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        settings: true,
        dailyLogs: { orderBy: { date: 'asc' } },
        subjects: true,
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const { browser, os } = parseUserAgent(user.lastLoginUserAgent);

    return {
      account: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isGuest: user.isGuest,
        blocked: user.blocked,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        lastLoginIp: user.lastLoginIp,
        lastLoginBrowser: browser,
        lastLoginOs: os,
      },
      evolution: {
        daysActive: user.dailyLogs.length,
        totalHours:
          Math.round(((user.settings?.totalFocusMinutes ?? 0) / 60) * 10) / 10,
        currentStreak: user.settings?.currentStreak ?? 0,
        longestStreak: user.settings?.longestStreak ?? 0,
        challengeStartDate: user.settings?.challengeStartDate ?? null,
        dailyLogs: user.dailyLogs,
      },
      goals: user.subjects,
    };
  }

  setBlocked(adminId: string, id: string, blocked: boolean) {
    if (adminId === id) {
      throw new ForbiddenException('Você não pode bloquear a própria conta');
    }
    return this.prisma.user.update({ where: { id }, data: { blocked } });
  }

  setRole(adminId: string, id: string, role: 'user' | 'admin') {
    if (adminId === id) {
      throw new ForbiddenException(
        'Você não pode alterar a permissão da própria conta',
      );
    }
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  async deleteUser(adminId: string, id: string) {
    if (adminId === id) {
      throw new ForbiddenException('Você não pode excluir a própria conta');
    }
    // groups.ownerId is ON DELETE RESTRICT (a group shouldn't silently
    // vanish just because its owner deleted their own account elsewhere in
    // the app) — but an admin forcibly removing an account needs it gone
    // regardless, so explicitly clear owned groups first instead of
    // letting the FK reject the delete.
    await this.prisma.$transaction([
      this.prisma.group.deleteMany({ where: { ownerId: id } }),
      this.prisma.user.delete({ where: { id } }),
    ]);
    return { success: true };
  }

  async resetProgress(id: string) {
    await this.prisma.dailyLog.deleteMany({ where: { userId: id } });
    await this.prisma.settings.updateMany({
      where: { userId: id },
      data: {
        xp: 0,
        totalPomodoros: 0,
        totalTasksCompleted: 0,
        totalReviewsCompleted: 0,
        awardedTaskIds: [],
        awardedReviewIds: [],
        challengeStartDate: new Date(),
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        totalFocusMinutes: 0,
      },
    });
    return { success: true };
  }

  async listGroups(params: ListGroupsParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const where: Prisma.GroupWhereInput = {};

    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }
    if (params.type) where.type = params.type;

    const [items, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          owner: { select: { id: true, name: true } },
          _count: { select: { members: true } },
        },
      }),
      this.prisma.group.count({ where }),
    ]);

    return {
      items: items.map((group) => ({
        id: group.id,
        name: group.name,
        icon: group.icon,
        type: group.type,
        memberCount: group._count.members,
        maxMembers: group.maxMembers,
        ownerId: group.owner.id,
        ownerName: group.owner.name,
        createdAt: group.createdAt,
      })),
      total,
      page,
      pageSize: PAGE_SIZE,
    };
  }

  async getGroupDetail(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
    if (!group) throw new NotFoundException('Grupo não encontrado');

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      icon: group.icon,
      type: group.type,
      maxMembers: group.maxMembers,
      inviteCode: group.inviteCode,
      createdAt: group.createdAt,
      owner: group.owner,
      members: group.members.map((member) => ({
        userId: member.userId,
        name: member.user.name,
        email: member.user.email,
        joinedAt: member.joinedAt,
        isOwner: member.userId === group.owner.id,
      })),
    };
  }

  // Admin override — unlike GroupsService.remove(), this doesn't require
  // the caller to own the group, since an admin needs to be able to remove
  // any group (spam, abuse reports, etc).
  async deleteGroup(id: string) {
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) throw new NotFoundException('Grupo não encontrado');
    await this.prisma.group.delete({ where: { id } });
    return { success: true };
  }

  async listLogs(params: ListLogsParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const where: Prisma.RequestLogWhereInput = {};

    if (params.userId) where.userId = params.userId;
    if (params.endpoint) where.endpoint = { contains: params.endpoint };
    if (params.eventType) where.eventType = params.eventType;
    if (params.statusCode) where.statusCode = params.statusCode;
    if (params.from || params.to) {
      where.createdAt = {
        ...(params.from ? { gte: new Date(params.from) } : {}),
        ...(params.to ? { lte: new Date(params.to) } : {}),
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.requestLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * LOG_PAGE_SIZE,
        take: LOG_PAGE_SIZE,
      }),
      this.prisma.requestLog.count({ where }),
    ]);

    return { items, total, page, pageSize: LOG_PAGE_SIZE };
  }

  listErrors() {
    return this.prisma.errorLog.findMany({ orderBy: { lastSeenAt: 'desc' } });
  }

  async getError(id: string) {
    const error = await this.prisma.errorLog.findUnique({ where: { id } });
    if (!error) throw new NotFoundException('Erro não encontrado');
    return error;
  }

  // Lightweight, meant to be polled every few seconds by the front end —
  // also doubles as the "is the API reachable" signal (a failed fetch to
  // this route, not its payload, is what tells the client the API is down).
  async getHealth() {
    const database = await this.databaseHealth.check();
    return {
      api: { status: 'online' },
      database,
      process: {
        memory: this.processMetrics.getMemoryUsage(),
        cpuPercent: this.processMetrics.getCpuPercent(),
      },
    };
  }

  async getHealthHistory(hours: number) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.prisma.healthSnapshot.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getRequestsTimeline(minutes: number) {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    const logs = await this.prisma.requestLog.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, statusCode: true },
    });

    const buckets = new Map<string, { total: number; errors: number }>();
    const now = new Date();
    for (let i = minutes - 1; i >= 0; i--) {
      const bucketTime = new Date(now.getTime() - i * 60 * 1000);
      bucketTime.setSeconds(0, 0);
      buckets.set(bucketTime.toISOString(), { total: 0, errors: 0 });
    }

    for (const log of logs) {
      const bucketTime = new Date(log.createdAt);
      bucketTime.setSeconds(0, 0);
      const key = bucketTime.toISOString();
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.total += 1;
      if (log.statusCode >= 400) bucket.errors += 1;
    }

    return Array.from(buckets.entries()).map(([minute, counts]) => ({
      minute,
      ...counts,
    }));
  }

  async getRealtime() {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const tenSecAgo = new Date(Date.now() - 10 * 1000);

    const [activeUsers, recentRequests, database] = await Promise.all([
      this.prisma.requestLog.findMany({
        where: { createdAt: { gte: fiveMinAgo }, userId: { not: null } },
        select: { userId: true },
        distinct: ['userId'],
      }),
      this.prisma.requestLog.count({ where: { createdAt: { gte: tenSecAgo } } }),
      this.databaseHealth.check(),
    ]);

    return {
      activeUsers: activeUsers.length,
      requestsPerSecond: Math.round((recentRequests / 10) * 10) / 10,
      database,
      process: {
        memory: this.processMetrics.getMemoryUsage(),
        cpuPercent: this.processMetrics.getCpuPercent(),
      },
    };
  }

  async listAlerts() {
    const alerts = await this.prisma.alert.findMany();
    const open = alerts
      .filter((alert) => !alert.resolvedAt)
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
    const resolved = alerts
      .filter((alert) => alert.resolvedAt)
      .sort(
        (a, b) => (b.resolvedAt as Date).getTime() - (a.resolvedAt as Date).getTime(),
      );
    return [...open, ...resolved];
  }
}
