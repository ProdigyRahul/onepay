/*
  Warnings:

  - You are about to drop the column `incomeRange` on the `kyc` table. All the data in the column will be lost.
  - You are about to drop the column `purposeType` on the `kyc` table. All the data in the column will be lost.
  - You are about to drop the column `savingGoal` on the `kyc` table. All the data in the column will be lost.
  - You are about to drop the column `spendingType` on the `kyc` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SpendingHabit" AS ENUM ('SPEND_ALL', 'SPEND_NONE', 'SPEND_SOMETIMES', 'SAVE_MOST');

-- CreateEnum
CREATE TYPE "UserGoal" AS ENUM ('EVERYDAY_PAYMENTS', 'LOANS', 'INVESTMENTS', 'TRACK_EXPENSES');

-- AlterTable
ALTER TABLE "kyc" DROP COLUMN "incomeRange",
DROP COLUMN "purposeType",
DROP COLUMN "savingGoal",
DROP COLUMN "spendingType";

-- CreateTable
CREATE TABLE "financial_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "incomeRange" "IncomeRange" NOT NULL,
    "targetSpendingPercentage" DOUBLE PRECISION NOT NULL,
    "spendingHabit" "SpendingHabit" NOT NULL,
    "targetSavingsPercentage" DOUBLE PRECISION NOT NULL,
    "primaryGoal" "UserGoal" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "financial_profiles_userId_key" ON "financial_profiles"("userId");

-- AddForeignKey
ALTER TABLE "financial_profiles" ADD CONSTRAINT "financial_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
