import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

interface ScheduleTask {
  id: string;
  subjectId: string;
  [key: string]: unknown;
}

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.subject.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(userId: string, dto: CreateSubjectDto) {
    return this.prisma.subject.create({ data: { ...dto, userId } });
  }

  async update(userId: string, id: string, dto: UpdateSubjectDto) {
    const existing = await this.assertOwnership(userId, id);

    const data = { ...dto };
    if (data.completedLessons !== undefined) {
      // totalLessons may be arriving in this same request (form save) or
      // already sitting on the row (card's +/- stepper, which only ever
      // sends completedLessons) — either way, never let it drift past the
      // total or below zero.
      const total = data.totalLessons ?? existing.totalLessons;
      data.completedLessons =
        total != null
          ? Math.min(Math.max(data.completedLessons, 0), total)
          : Math.max(data.completedLessons, 0);
    }

    return this.prisma.subject.update({ where: { id }, data });
  }

  // Reviews and schedule tasks reference a subject only by a bare id
  // (no DB relation) — deleting the subject without cleaning those up
  // left them permanently orphaned: invisible in every screen that reads
  // them, but still counted in "Resumo do Dia"'s totals, making the
  // day's goal impossible to ever complete again.
  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id);

    await this.prisma.$transaction(async (tx) => {
      await tx.review.deleteMany({ where: { userId, subjectId: id } });

      const plan = await tx.plan.findUnique({ where: { userId } });
      const schedule = plan?.schedule as Record<string, ScheduleTask[]> | null;
      if (schedule && typeof schedule === 'object') {
        const cleaned: Record<string, ScheduleTask[]> = {};
        let changed = false;
        for (const [day, tasks] of Object.entries(schedule)) {
          const kept = Array.isArray(tasks)
            ? tasks.filter((task) => task.subjectId !== id)
            : tasks;
          if (Array.isArray(tasks) && kept.length !== tasks.length)
            changed = true;
          cleaned[day] = kept;
        }
        if (changed) {
          await tx.plan.update({
            where: { userId },
            data: { schedule: cleaned as Prisma.InputJsonValue },
          });
        }
      }

      await tx.subject.delete({ where: { id } });
    });
  }

  private async assertOwnership(userId: string, id: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject || subject.userId !== userId) {
      throw new NotFoundException('Matéria não encontrada');
    }
    return subject;
  }
}
