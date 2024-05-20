/*
  Warnings:

  - You are about to drop the column `expenseId` on the `Settlement` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Settlement" DROP CONSTRAINT "Settlement_expenseId_fkey";

-- AlterTable
ALTER TABLE "Settlement" DROP COLUMN "expenseId";
