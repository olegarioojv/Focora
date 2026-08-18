import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertDayPlanDto } from './dto/upsert-day-plan.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { ReorderSessionsDto } from './dto/reorder-sessions.dto';

@Injectable()
export class DayPlanService {
  constructor(private readonly prisma: PrismaService) {}

  findAllConfigs(userId: string) {
    return this.prisma.dayPlanConfig.findMany({
      where: { userId },
      include: { entries: true },
    });
  }

  async upsertConfig(
    userId: string,
    weekday: string,
    category: string,
    dto: UpsertDayPlanDto,
  ) {
    // Selecting fewer subjects than subjectCount is a valid, expected state
    // now — the gap gets auto-filled with random subjects when the
    // schedule is (re)generated. Only reject if there are MORE entries
    // than the configured count.
    if (dto.entries.length > dto.subjectCount) {
      throw new BadRequestException(
        'A quantidade de matérias selecionadas é maior que o limite do dia',
      );
    }
    const subjectIds = dto.entries.map((entry) => entry.subjectId);
    if (new Set(subjectIds).size !== subjectIds.length) {
      throw new BadRequestException(
        'Não é possível repetir a mesma matéria no mesmo dia',
      );
    }

    const config = await this.prisma.dayPlanConfig.upsert({
      where: { userId_weekday_category: { userId, weekday, category } },
      update: { subjectCount: dto.subjectCount },
      create: { userId, weekday, category, subjectCount: dto.subjectCount },
    });

    await this.prisma.dayPlanEntry.deleteMany({
      where: { dayConfigId: config.id },
    });
    if (dto.entries.length > 0) {
      await this.prisma.dayPlanEntry.createMany({
        data: dto.entries.map((entry) => ({
          dayConfigId: config.id,
          subjectId: entry.subjectId,
          durationMinutes: entry.durationMinutes,
          repetitions: entry.repetitions,
        })),
      });
    }

    return this.prisma.dayPlanConfig.findUnique({
      where: { id: config.id },
      include: { entries: true },
    });
  }

  findSessions(userId: string, weekStart: string) {
    return this.prisma.studySession.findMany({
      where: { userId, weekStart },
      orderBy: [{ weekday: 'asc' }, { position: 'asc' }],
    });
  }

  async syncCurrentWeek(userId: string, weekStart: string) {
    const configs = await this.prisma.dayPlanConfig.findMany({
      where: { userId },
      include: { entries: true },
    });

    const expected: {
      userId: string;
      subjectId: string;
      category: string;
      weekday: string;
      weekStart: string;
      durationMinutes: number;
      sequence: number;
      position: number;
    }[] = [];

    for (const config of configs) {
      for (const entry of config.entries) {
        for (let sequence = 1; sequence <= entry.repetitions; sequence += 1) {
          expected.push({
            userId,
            subjectId: entry.subjectId,
            category: config.category,
            weekday: config.weekday,
            weekStart,
            durationMinutes: entry.durationMinutes,
            sequence,
            position: sequence - 1,
          });
        }
      }
    }

    await this.prisma.studySession.deleteMany({
      where: { userId, weekStart, completed: false },
    });
    if (expected.length > 0) {
      await this.prisma.studySession.createMany({
        data: expected,
        skipDuplicates: true,
      });
    }

    return this.findSessions(userId, weekStart);
  }

  async createSession(userId: string, dto: CreateSessionDto) {
    const [maxPosition, maxSequence] = await Promise.all([
      this.prisma.studySession.aggregate({
        where: { userId, weekStart: dto.weekStart, weekday: dto.weekday },
        _max: { position: true },
      }),
      this.prisma.studySession.aggregate({
        where: {
          userId,
          weekStart: dto.weekStart,
          weekday: dto.weekday,
          category: dto.category,
          subjectId: dto.subjectId,
        },
        _max: { sequence: true },
      }),
    ]);

    return this.prisma.studySession.create({
      data: {
        userId,
        weekStart: dto.weekStart,
        weekday: dto.weekday,
        category: dto.category,
        subjectId: dto.subjectId,
        durationMinutes: dto.durationMinutes,
        sequence: (maxSequence._max.sequence ?? 0) + 1,
        position: (maxPosition._max.position ?? -1) + 1,
      },
    });
  }

  async toggleCompleted(userId: string, id: string, completed: boolean) {
    await this.assertOwnership(userId, id);
    return this.prisma.studySession.update({
      where: { id },
      data: { completed, completedAt: completed ? new Date() : null },
    });
  }

  async removeSession(userId: string, id: string) {
    await this.assertOwnership(userId, id);
    await this.prisma.studySession.delete({ where: { id } });
  }

  async reorder(userId: string, dto: ReorderSessionsDto) {
    await this.prisma.$transaction(
      dto.changes.flatMap((change) =>
        change.orderedIds.map((id, index) =>
          this.prisma.studySession.updateMany({
            where: { id, userId },
            data: { weekday: change.weekday, position: index },
          }),
        ),
      ),
    );
    return this.prisma.studySession.findMany({
      where: { userId, id: { in: dto.changes.flatMap((c) => c.orderedIds) } },
    });
  }

  private async assertOwnership(userId: string, id: string) {
    const session = await this.prisma.studySession.findUnique({
      where: { id },
    });
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Sessão não encontrada');
    }
    return session;
  }
}
