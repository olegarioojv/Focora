-- CreateIndex
CREATE INDEX "error_logs_lastSeenAt_idx" ON "error_logs"("lastSeenAt");

-- CreateIndex
CREATE INDEX "group_members_userId_idx" ON "group_members"("userId");

-- CreateIndex
CREATE INDEX "groups_ownerId_idx" ON "groups"("ownerId");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- CreateIndex
CREATE INDEX "subjects_userId_idx" ON "subjects"("userId");

-- CreateIndex
CREATE INDEX "users_isGuest_guestExpiresAt_idx" ON "users"("isGuest", "guestExpiresAt");
