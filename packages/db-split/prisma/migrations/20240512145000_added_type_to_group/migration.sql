/*
  Warnings:

  - Added the required column `type` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('TRIP', 'HOME', 'COUPLE', 'OTHER');

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "type" "GroupType" NOT NULL;
