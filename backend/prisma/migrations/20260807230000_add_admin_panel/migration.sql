-- AlterTable
ALTER TABLE "users"
  ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user',
  ADD COLUMN "blocked" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "lastLoginAt" TIMESTAMP(3),
  ADD COLUMN "lastLoginIp" TEXT,
  ADD COLUMN "lastLoginUserAgent" TEXT;

-- AlterTable
ALTER TABLE "settings"
  ADD COLUMN "longestStreak" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "request_logs" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "method" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "statusCode" INTEGER NOT NULL,
  "durationMs" INTEGER NOT NULL,
  "userId" TEXT,
  "targetUserId" TEXT,
  "eventType" TEXT NOT NULL,
  "message" TEXT,
  "ip" TEXT,
  "userAgent" TEXT,
  "browser" TEXT,
  "os" TEXT,
  CONSTRAINT "request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "request_logs_createdAt_idx" ON "request_logs"("createdAt");
CREATE INDEX "request_logs_userId_idx" ON "request_logs"("userId");
CREATE INDEX "request_logs_eventType_idx" ON "request_logs"("eventType");

-- CreateTable
CREATE TABLE "error_logs" (
  "id" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "stack" TEXT,
  "endpoint" TEXT,
  "method" TEXT,
  "userId" TEXT,
  "severity" TEXT NOT NULL DEFAULT 'error',
  "environment" TEXT NOT NULL DEFAULT 'development',
  "occurrenceCount" INTEGER NOT NULL DEFAULT 1,
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "error_logs_fingerprint_key" ON "error_logs"("fingerprint");
