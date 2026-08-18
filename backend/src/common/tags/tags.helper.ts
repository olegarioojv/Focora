import type { Prisma } from '../../../generated/prisma/client';

type Tx = Prisma.TransactionClient;

async function upsertTagIds(tx: Tx, userId: string, tagNames: string[]): Promise<string[]> {
  const names = [...new Set(tagNames.map((n) => n.trim()).filter(Boolean))];
  const tags = await Promise.all(
    names.map((name) =>
      tx.tag.upsert({
        where: { userId_name: { userId, name } },
        create: { userId, name },
        update: {},
      }),
    ),
  );
  return tags.map((t) => t.id);
}

export async function syncNoteTags(
  tx: Tx,
  userId: string,
  noteId: string,
  tagNames: string[],
): Promise<void> {
  const tagIds = await upsertTagIds(tx, userId, tagNames);
  await tx.noteTag.deleteMany({ where: { noteId } });
  if (tagIds.length > 0) {
    await tx.noteTag.createMany({
      data: tagIds.map((tagId) => ({ noteId, tagId })),
    });
  }
}

export async function syncFlashcardTags(
  tx: Tx,
  userId: string,
  flashcardId: string,
  tagNames: string[],
): Promise<void> {
  const tagIds = await upsertTagIds(tx, userId, tagNames);
  await tx.flashcardTag.deleteMany({ where: { flashcardId } });
  if (tagIds.length > 0) {
    await tx.flashcardTag.createMany({
      data: tagIds.map((tagId) => ({ flashcardId, tagId })),
    });
  }
}
