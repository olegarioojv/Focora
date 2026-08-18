-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "durationMinutes" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "reviewDurationMinutes" INTEGER NOT NULL DEFAULT 30;
