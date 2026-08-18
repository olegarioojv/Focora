import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { syncNoteTags } from '../common/tags/tags.helper';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

const NOTE_INCLUDE = {
  tags: { include: { tag: true } },
  outboundLinks: true,
  inboundLinks: true,
} satisfies Prisma.NoteInclude;

const LINK_PATTERN = /\[\[([^\]]+)\]\]/g;

type Tx = Prisma.TransactionClient;

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: NOTE_INCLUDE,
    });
  }

  create(userId: string, dto: CreateNoteDto) {
    return this.prisma.$transaction(async (tx) => {
      const note = await tx.note.create({
        data: {
          userId,
          title: dto.title,
          content: dto.content ?? '',
          subjectId: dto.subjectId ?? null,
          isFavorite: dto.isFavorite ?? false,
          isArchived: dto.isArchived ?? false,
        },
      });

      await syncNoteTags(tx, userId, note.id, dto.tags ?? []);
      await this.syncLinks(tx, userId, note.id, dto.content ?? '');

      return tx.note.findUniqueOrThrow({
        where: { id: note.id },
        include: NOTE_INCLUDE,
      });
    });
  }

  async update(userId: string, id: string, dto: UpdateNoteDto) {
    await this.assertOwnership(userId, id);

    return this.prisma.$transaction(async (tx) => {
      await tx.note.update({
        where: { id },
        data: {
          title: dto.title,
          content: dto.content,
          subjectId:
            dto.subjectId === undefined ? undefined : (dto.subjectId ?? null),
          isFavorite: dto.isFavorite,
          isArchived: dto.isArchived,
        },
      });

      if (dto.tags !== undefined) {
        await syncNoteTags(tx, userId, id, dto.tags);
      }
      if (dto.content !== undefined) {
        await this.syncLinks(tx, userId, id, dto.content);
      }

      return tx.note.findUniqueOrThrow({
        where: { id },
        include: NOTE_INCLUDE,
      });
    });
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id);
    // Cascades handle NoteTag/NoteLink cleanup and null out Flashcard.noteId
    // via the schema's own onDelete rules.
    await this.prisma.note.delete({ where: { id } });
  }

  private async syncLinks(
    tx: Tx,
    userId: string,
    noteId: string,
    content: string,
  ): Promise<void> {
    const titles = new Set<string>();
    for (const match of content.matchAll(LINK_PATTERN)) {
      const title = match[1]?.trim();
      if (title) titles.add(title);
    }

    const resolved = await Promise.all(
      [...titles].map((title) =>
        tx.note.findFirst({
          where: { userId, title: { equals: title, mode: 'insensitive' } },
        }),
      ),
    );

    const targets = resolved.filter(
      (note): note is NonNullable<typeof note> =>
        note !== null && note.id !== noteId,
    );

    await tx.noteLink.deleteMany({ where: { sourceNoteId: noteId } });
    if (targets.length > 0) {
      await tx.noteLink.createMany({
        data: targets.map((t) => ({ sourceNoteId: noteId, targetNoteId: t.id })),
      });
    }
  }

  private async assertOwnership(userId: string, id: string) {
    const note = await this.prisma.note.findUnique({ where: { id } });
    if (!note || note.userId !== userId) {
      throw new NotFoundException('Nota não encontrada');
    }
    return note;
  }
}
