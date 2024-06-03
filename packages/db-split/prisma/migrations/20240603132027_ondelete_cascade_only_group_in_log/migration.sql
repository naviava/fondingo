-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_expenseId_fkey";

-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_friendRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_settlementId_fkey";

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_friendRequestId_fkey" FOREIGN KEY ("friendRequestId") REFERENCES "FriendRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
