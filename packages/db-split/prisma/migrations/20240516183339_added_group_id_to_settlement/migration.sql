/*
  Warnings:

  - Added the required column `groupId` to the `Settlement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Settlement" ADD COLUMN     "groupId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
