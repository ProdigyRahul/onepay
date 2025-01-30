/*
  Warnings:

  - You are about to drop the column `isVerified` on the `bank_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `bankAccountId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `upiTransactionRef` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_bankAccountId_fkey";

-- DropIndex
DROP INDEX "bank_accounts_ifscCode_idx";

-- DropIndex
DROP INDEX "bank_accounts_walletId_accountNumber_key";

-- AlterTable
ALTER TABLE "bank_accounts" DROP COLUMN "isVerified";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "balance",
DROP COLUMN "bankAccountId",
DROP COLUMN "upiTransactionRef";

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'SAVINGS';
