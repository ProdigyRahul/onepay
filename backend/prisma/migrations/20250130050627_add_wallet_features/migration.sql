/*
  Warnings:

  - You are about to drop the `transfers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountNumber]` on the table `wallets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[upiId]` on the table `wallets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - The required column `accountNumber` was added to the `wallets` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('SAVINGS', 'CURRENT');

-- DropForeignKey
ALTER TABLE "transfers" DROP CONSTRAINT "transfers_receiverWalletId_fkey";

-- DropForeignKey
ALTER TABLE "transfers" DROP CONSTRAINT "transfers_senderWalletId_fkey";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "bankAccountId" TEXT,
ADD COLUMN     "receiverWalletId" TEXT,
ADD COLUMN     "senderWalletId" TEXT,
ADD COLUMN     "transactionId" TEXT NOT NULL,
ADD COLUMN     "upiTransactionRef" TEXT;

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "accountNumber" TEXT NOT NULL,
ADD COLUMN     "upiId" TEXT,
ALTER COLUMN "currency" SET DEFAULT 'INR';

-- DropTable
DROP TABLE "transfers";

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountType" "BankAccountType" NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_accounts_walletId_idx" ON "bank_accounts"("walletId");

-- CreateIndex
CREATE INDEX "bank_accounts_accountNumber_idx" ON "bank_accounts"("accountNumber");

-- CreateIndex
CREATE INDEX "bank_accounts_ifscCode_idx" ON "bank_accounts"("ifscCode");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_walletId_accountNumber_key" ON "bank_accounts"("walletId", "accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transactionId_key" ON "transactions"("transactionId");

-- CreateIndex
CREATE INDEX "transactions_transactionId_idx" ON "transactions"("transactionId");

-- CreateIndex
CREATE INDEX "transactions_senderWalletId_idx" ON "transactions"("senderWalletId");

-- CreateIndex
CREATE INDEX "transactions_receiverWalletId_idx" ON "transactions"("receiverWalletId");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_accountNumber_key" ON "wallets"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_upiId_key" ON "wallets"("upiId");

-- CreateIndex
CREATE INDEX "wallets_accountNumber_idx" ON "wallets"("accountNumber");

-- CreateIndex
CREATE INDEX "wallets_upiId_idx" ON "wallets"("upiId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_senderWalletId_fkey" FOREIGN KEY ("senderWalletId") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_receiverWalletId_fkey" FOREIGN KEY ("receiverWalletId") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
