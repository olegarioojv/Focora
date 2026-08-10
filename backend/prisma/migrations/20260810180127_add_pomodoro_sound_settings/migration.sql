-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "pomodoroBreakEndSound" TEXT NOT NULL DEFAULT 'digital',
ADD COLUMN     "pomodoroBreakStartSound" TEXT NOT NULL DEFAULT 'suave',
ADD COLUMN     "pomodoroFocusEndSound" TEXT NOT NULL DEFAULT 'classico',
ADD COLUMN     "pomodoroFocusStartSound" TEXT NOT NULL DEFAULT 'sino',
ADD COLUMN     "pomodoroSoundVolume" INTEGER NOT NULL DEFAULT 70,
ADD COLUMN     "pomodoroSoundsEnabled" BOOLEAN NOT NULL DEFAULT true;
