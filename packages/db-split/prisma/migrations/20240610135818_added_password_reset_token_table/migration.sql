-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_email_key" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_userEmail_key" ON "PasswordResetToken"("userEmail");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "Expense_groupId_idx" ON "Expense"("groupId");

-- CreateIndex
CREATE INDEX "ExpensePayment_expenseId_groupMemberId_idx" ON "ExpensePayment"("expenseId", "groupMemberId");

-- CreateIndex
CREATE INDEX "ExpenseSplit_expenseId_groupMemberId_idx" ON "ExpenseSplit"("expenseId", "groupMemberId");

-- CreateIndex
CREATE INDEX "GroupMember_userId_groupId_idx" ON "GroupMember"("userId", "groupId");

-- CreateIndex
CREATE INDEX "Log_userId_groupId_expenseId_settlementId_friendRequestId_idx" ON "Log"("userId", "groupId", "expenseId", "settlementId", "friendRequestId");

-- CreateIndex
CREATE INDEX "Settlement_groupId_idx" ON "Settlement"("groupId");

-- CreateIndex
CREATE INDEX "SimplifiedDebt_groupId_idx" ON "SimplifiedDebt"("groupId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
