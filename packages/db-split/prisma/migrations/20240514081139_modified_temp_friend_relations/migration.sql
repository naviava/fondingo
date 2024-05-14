/*
  Warnings:

  - You are about to drop the column `user1Id` on the `TempFriend` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,email]` on the table `TempFriend` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "TempFriend" DROP CONSTRAINT "TempFriend_user1Id_fkey";

-- DropIndex
DROP INDEX "TempFriend_user1Id_email_key";

-- AlterTable
ALTER TABLE "TempFriend" DROP COLUMN "user1Id",
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TempFriend_userId_email_key" ON "TempFriend"("userId", "email");

-- AddForeignKey
ALTER TABLE "TempFriend" ADD CONSTRAINT "TempFriend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
