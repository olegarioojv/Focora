-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "challengeStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastActiveDate" TEXT,
ADD COLUMN     "totalFocusMinutes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "daily_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL DEFAULT 0,
    "pomodoros" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_logs_userId_date_key" ON "daily_logs"("userId", "date");

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
