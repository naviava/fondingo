-- DropIndex
DROP INDEX "ExpensePayment_expenseId_groupMemberId_idx";

-- DropIndex
DROP INDEX "ExpenseSplit_expenseId_groupMemberId_idx";

-- DropIndex
DROP INDEX "GroupMember_userId_groupId_idx";

-- DropIndex
DROP INDEX "Log_userId_groupId_expenseId_settlementId_friendRequestId_idx";

-- DropIndex
DROP INDEX "PasswordResetToken_email_idx";

-- CreateIndex
CREATE INDEX "GroupMember_groupId_idx" ON "GroupMember"("groupId");
