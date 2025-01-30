/*
  Warnings:

  - You are about to drop the column `upiId` on the `wallets` table. All the data in the column will be lost.
  - You are about to drop the `bank_accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_walletId_fkey";

-- DropIndex
DROP INDEX "wallets_upiId_idx";

-- DropIndex
DROP INDEX "wallets_upiId_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "wallets" DROP COLUMN "upiId";

-- DropTable
DROP TABLE "bank_accounts";

-- DropEnum
DROP TYPE "BankAccountType";
