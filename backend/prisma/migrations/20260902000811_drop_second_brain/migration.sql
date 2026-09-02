-- DropForeignKey
ALTER TABLE "flashcard_tags" DROP CONSTRAINT "flashcard_tags_flashcardId_fkey";

-- DropForeignKey
ALTER TABLE "flashcard_tags" DROP CONSTRAINT "flashcard_tags_tagId_fkey";

-- DropForeignKey
ALTER TABLE "flashcards" DROP CONSTRAINT "flashcards_noteId_fkey";

-- DropForeignKey
ALTER TABLE "flashcards" DROP CONSTRAINT "flashcards_userId_fkey";

-- DropForeignKey
ALTER TABLE "note_links" DROP CONSTRAINT "note_links_sourceNoteId_fkey";

-- DropForeignKey
ALTER TABLE "note_links" DROP CONSTRAINT "note_links_targetNoteId_fkey";

-- DropForeignKey
ALTER TABLE "note_tags" DROP CONSTRAINT "note_tags_noteId_fkey";

-- DropForeignKey
ALTER TABLE "note_tags" DROP CONSTRAINT "note_tags_tagId_fkey";

-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_userId_fkey";

-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_userId_fkey";

-- DropTable
DROP TABLE "flashcard_tags";

-- DropTable
DROP TABLE "flashcards";

-- DropTable
DROP TABLE "note_links";

-- DropTable
DROP TABLE "note_tags";

-- DropTable
DROP TABLE "notes";

-- DropTable
DROP TABLE "tags";

