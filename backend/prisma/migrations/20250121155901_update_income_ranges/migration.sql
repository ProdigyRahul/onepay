/*
  Warnings:

  - The values [RANGE_0_12500,RANGE_12500_25000,RANGE_25000_50000,RANGE_50000_150000,RANGE_150000_300000,RANGE_300000_2500000,RANGE_2500000_PLUS] on the enum `IncomeRange` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IncomeRange_new" AS ENUM ('RANGE_0_25000', 'RANGE_25000_100000', 'RANGE_100000_300000', 'RANGE_300000_PLUS');
ALTER TABLE "financial_profiles" ALTER COLUMN "incomeRange" TYPE "IncomeRange_new" USING ("incomeRange"::text::"IncomeRange_new");
ALTER TYPE "IncomeRange" RENAME TO "IncomeRange_old";
ALTER TYPE "IncomeRange_new" RENAME TO "IncomeRange";
DROP TYPE "IncomeRange_old";
COMMIT;
