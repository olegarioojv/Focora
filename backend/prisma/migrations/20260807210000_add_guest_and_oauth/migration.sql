-- AlterTable
ALTER TABLE "users"
  ALTER COLUMN "email" DROP NOT NULL,
  ALTER COLUMN "password" DROP NOT NULL,
  ADD COLUMN "isGuest" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "guestExpiresAt" TIMESTAMP(3),
  ADD COLUMN "googleId" TEXT,
  ADD COLUMN "githubId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_githubId_key" ON "users"("githubId");
