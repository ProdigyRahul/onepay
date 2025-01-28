-- CreateIndex
CREATE INDEX "budgets_userId_idx" ON "budgets"("userId");

-- CreateIndex
CREATE INDEX "budgets_category_idx" ON "budgets"("category");

-- CreateIndex
CREATE INDEX "budgets_period_idx" ON "budgets"("period");

-- CreateIndex
CREATE INDEX "financial_profiles_userId_idx" ON "financial_profiles"("userId");

-- CreateIndex
CREATE INDEX "financial_profiles_incomeRange_idx" ON "financial_profiles"("incomeRange");

-- CreateIndex
CREATE INDEX "financial_profiles_primaryGoal_idx" ON "financial_profiles"("primaryGoal");

-- CreateIndex
CREATE INDEX "gamification_profiles_userId_idx" ON "gamification_profiles"("userId");

-- CreateIndex
CREATE INDEX "gamification_profiles_level_idx" ON "gamification_profiles"("level");

-- CreateIndex
CREATE INDEX "gamification_profiles_points_idx" ON "gamification_profiles"("points");

-- CreateIndex
CREATE INDEX "kyc_userId_idx" ON "kyc"("userId");

-- CreateIndex
CREATE INDEX "kyc_panNumber_idx" ON "kyc"("panNumber");

-- CreateIndex
CREATE INDEX "kyc_status_idx" ON "kyc"("status");

-- CreateIndex
CREATE INDEX "learning_modules_title_idx" ON "learning_modules"("title");

-- CreateIndex
CREATE INDEX "learning_modules_points_idx" ON "learning_modules"("points");

-- CreateIndex
CREATE INDEX "learning_progress_userId_idx" ON "learning_progress"("userId");

-- CreateIndex
CREATE INDEX "learning_progress_moduleId_idx" ON "learning_progress"("moduleId");

-- CreateIndex
CREATE INDEX "learning_progress_progress_idx" ON "learning_progress"("progress");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_read_idx" ON "notifications"("read");

-- CreateIndex
CREATE INDEX "otps_phoneNumber_idx" ON "otps"("phoneNumber");

-- CreateIndex
CREATE INDEX "otps_userId_idx" ON "otps"("userId");

-- CreateIndex
CREATE INDEX "otps_expiresAt_idx" ON "otps"("expiresAt");

-- CreateIndex
CREATE INDEX "transactions_walletId_idx" ON "transactions"("walletId");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transfers_senderWalletId_idx" ON "transfers"("senderWalletId");

-- CreateIndex
CREATE INDEX "transfers_receiverWalletId_idx" ON "transfers"("receiverWalletId");

-- CreateIndex
CREATE INDEX "transfers_status_idx" ON "transfers"("status");

-- CreateIndex
CREATE INDEX "users_phoneNumber_idx" ON "users"("phoneNumber");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "wallets_userId_idx" ON "wallets"("userId");

-- CreateIndex
CREATE INDEX "wallets_balance_idx" ON "wallets"("balance");

-- CreateIndex
CREATE INDEX "wallets_isBlocked_idx" ON "wallets"("isBlocked");
