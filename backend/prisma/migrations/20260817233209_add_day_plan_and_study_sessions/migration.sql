-- CreateTable
CREATE TABLE "day_plan_configs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekday" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subjectCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "day_plan_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "day_plan_entries" (
    "id" TEXT NOT NULL,
    "dayConfigId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "repetitions" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "day_plan_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "weekday" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "day_plan_configs_userId_weekday_category_key" ON "day_plan_configs"("userId", "weekday", "category");

-- CreateIndex
CREATE INDEX "day_plan_entries_subjectId_idx" ON "day_plan_entries"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "day_plan_entries_dayConfigId_subjectId_key" ON "day_plan_entries"("dayConfigId", "subjectId");

-- CreateIndex
CREATE INDEX "study_sessions_userId_weekStart_idx" ON "study_sessions"("userId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "study_sessions_userId_weekStart_weekday_category_subjectId__key" ON "study_sessions"("userId", "weekStart", "weekday", "category", "subjectId", "sequence");

-- AddForeignKey
ALTER TABLE "day_plan_configs" ADD CONSTRAINT "day_plan_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "day_plan_entries" ADD CONSTRAINT "day_plan_entries_dayConfigId_fkey" FOREIGN KEY ("dayConfigId") REFERENCES "day_plan_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
