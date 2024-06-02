/*
  Warnings:

  - Made the column `userId` on table `Log` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Log" ALTER COLUMN "userId" SET NOT NULL;
