import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { syncFlashcardTags } from '../common/tags/tags.helper';
import { addDaysToDateString, todayDateString } from '../common/utils/date';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { ReviewFlashcardDto } from './dto/review-flashcard.dto';
import { computeNextReview } from './sm2.util';

@Injectable()
export class FlashcardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.flashcard.findMany({
      where: { userId },
      orderBy: { nextReviewDate: 'asc' },
      include: { tags: { include: { tag: true } } },
    });
  }

  create(userId: string, dto: CreateFlashcardDto) {
    return this.prisma.$transaction(async (tx) => {
      const today = todayDateString();

      // New cards are immediately due — easeFactor/intervalDays/repetitions
      // are left unset here so the Prisma schema defaults (2.5/0/0) apply.
      const flashcard = await tx.flashcard.create({
        data: {
          userId,
          front: dto.front,
          back: dto.back,
          noteId: dto.noteId ?? null,
          subjectId: dto.subjectId ?? null,
          nextReviewDate: today,
        },
      });

      await syncFlashcardTags(tx, userId, flashcard.id, dto.tags ?? []);

      return tx.flashcard.findUniqueOrThrow({
        where: { id: flashcard.id },
        include: { tags: { include: { tag: true } } },
      });
    });
  }

  async update(userId: string, id: string, dto: UpdateFlashcardDto) {
    await this.assertOwnership(userId, id);

    return this.prisma.$transaction(async (tx) => {
      const data: {
        front?: string;
        back?: string;
        noteId?: string | null;
        subjectId?: string | null;
      } = {};
      if (dto.front !== undefined) data.front = dto.front;
      if (dto.back !== undefined) data.back = dto.back;
      if (dto.noteId !== undefined) data.noteId = dto.noteId;
      if (dto.subjectId !== undefined) data.subjectId = dto.subjectId;

      await tx.flashcard.update({ where: { id }, data });

      if (dto.tags !== undefined) {
        await syncFlashcardTags(tx, userId, id, dto.tags);
      }

      return tx.flashcard.findUniqueOrThrow({
        where: { id },
        include: { tags: { include: { tag: true } } },
      });
    });
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id);
    await this.prisma.flashcard.delete({ where: { id } });
  }

  async review(userId: string, id: string, dto: ReviewFlashcardDto) {
    const card = await this.assertOwnership(userId, id);

    const today = todayDateString();
    const result = computeNextReview(
      dto.rating,
      {
        easeFactor: card.easeFactor,
        intervalDays: card.intervalDays,
        repetitions: card.repetitions,
      },
      today,
      addDaysToDateString,
    );

    return this.prisma.flashcard.update({
      where: { id },
      data: { ...result, lastReviewedAt: new Date() },
    });
  }

  private async assertOwnership(userId: string, id: string) {
    const card = await this.prisma.flashcard.findUnique({ where: { id } });
    if (!card || card.userId !== userId) {
      throw new NotFoundException('Flashcard não encontrado');
    }
    return card;
  }
}
