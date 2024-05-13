/*
  Warnings:

  - A unique constraint covering the columns `[userId,email]` on the table `Friend` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `Friend` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Friend" ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Friend_userId_email_key" ON "Friend"("userId", "email");
