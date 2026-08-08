-- CreateTable
CREATE TABLE "health_snapshots" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dbStatus" TEXT NOT NULL,
  "dbLatencyMs" INTEGER,
  "cpuPercent" DOUBLE PRECISION NOT NULL,
  "memoryRssMb" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "health_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "health_snapshots_createdAt_idx" ON "health_snapshots"("createdAt");

-- CreateTable
CREATE TABLE "alerts" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'warning',
  "message" TEXT NOT NULL,
  "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alerts_type_resolvedAt_idx" ON "alerts"("type", "resolvedAt");
