-- The `progress` column was dead weight: nothing ever set it to anything
-- but its default of 0 (confirmed — no DTO field, no form input, no
-- service logic touched it). Progress is now computed from
-- completedLessons/totalLessons instead, which the user actually controls.
ALTER TABLE "subjects" DROP COLUMN "progress";
ALTER TABLE "subjects" ADD COLUMN "totalLessons" INTEGER;
ALTER TABLE "subjects" ADD COLUMN "completedLessons" INTEGER NOT NULL DEFAULT 0;
