-- CreateEnum
CREATE TYPE "CurrencyCode" AS ENUM ('INR', 'USD', 'GBP', 'EUR', 'JPY', 'CHF');

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "currency" "CurrencyCode" NOT NULL DEFAULT 'USD';
