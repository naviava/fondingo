/*
  Warnings:

  - Added the required column `lastModifiedById` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastModifiedById` to the `Settlement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "lastModifiedById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Settlement" ADD COLUMN     "lastModifiedById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
