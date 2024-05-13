/*
  Warnings:

  - Added the required column `email` to the `GroupMember` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `GroupMember` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GroupMember" ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL;
