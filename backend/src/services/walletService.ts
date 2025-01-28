import { TransactionType, Wallet } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/apiError';
import {
  CreateWalletDTO,
  TransactionDTO,
  TransferDTO,
  WalletLimitDTO,
  WalletStats,
} from '../types/wallet';
import { prisma } from '../lib/prisma';

export class WalletService {
  // Create a new wallet
  static async createWallet(userId: string, data: CreateWalletDTO): Promise<Wallet> {
    const hashedPin = await bcrypt.hash(data.pin, 10);

    return prisma.wallet.create({
      data: {
        userId,
        pin: hashedPin,
        currency: data.currency,
        dailyLimit: data.dailyLimit,
        monthlyLimit: data.monthlyLimit,
      },
    });
  }

  // Verify wallet PIN
  static async verifyPin(walletId: string, pin: string): Promise<boolean> {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    // Check if wallet is blocked
    if (wallet.isBlocked) {
      if (wallet.blockedUntil && wallet.blockedUntil > new Date()) {
        throw new ApiError(403, 'Wallet is blocked. Try again later.');
      }
      // Unblock wallet if block duration has passed
      await prisma.wallet.update({
        where: { id: walletId },
        data: { isBlocked: false, pinAttempts: 0 },
      });
    }

    const isValid = await bcrypt.compare(pin, wallet.pin);

    if (!isValid) {
      const attempts = wallet.pinAttempts + 1;
      if (attempts >= 3) {
        // Block wallet for 24 hours
        await prisma.wallet.update({
          where: { id: walletId },
          data: {
            isBlocked: true,
            blockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
            pinAttempts: 0,
          },
        });
        throw new ApiError(403, 'Wallet blocked due to too many invalid PIN attempts');
      }

      await prisma.wallet.update({
        where: { id: walletId },
        data: { pinAttempts: attempts },
      });

      throw new ApiError(401, `Invalid PIN. ${3 - attempts} attempts remaining`);
    }

    // Reset PIN attempts on successful verification
    if (wallet.pinAttempts > 0) {
      await prisma.wallet.update({
        where: { id: walletId },
        data: { pinAttempts: 0 },
      });
    }

    return true;
  }

  // Get wallet stats
  static async getWalletStats(walletId: string): Promise<WalletStats> {
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [dailySpent, monthlySpent] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          walletId,
          type: TransactionType.DEBIT,
          createdAt: { gte: today },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          walletId,
          type: TransactionType.DEBIT,
          createdAt: { gte: firstDayOfMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      dailySpent: dailySpent._sum.amount || 0,
      monthlySpent: monthlySpent._sum.amount || 0,
      remainingDailyLimit: wallet.dailyLimit - (dailySpent._sum.amount || 0),
      remainingMonthlyLimit: wallet.monthlyLimit - (monthlySpent._sum.amount || 0),
      totalBalance: wallet.balance,
    };
  }

  // Add money to wallet
  static async addMoney(walletId: string, data: TransactionDTO): Promise<Wallet> {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        throw new ApiError(404, 'Wallet not found');
      }

      if (!wallet.isActive) {
        throw new ApiError(403, 'Wallet is inactive');
      }

      const newBalance = wallet.balance + data.amount;

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId,
          type: TransactionType.CREDIT,
          amount: data.amount,
          balance: newBalance,
          description: data.description,
          metadata: data.metadata,
          status: 'COMPLETED',
        },
      });

      // Update wallet balance
      return tx.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
      });
    });
  }

  // Transfer money between wallets
  static async transfer(
    senderWalletId: string,
    data: TransferDTO
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Verify sender's wallet and PIN
      const senderWallet = await tx.wallet.findUnique({
        where: { id: senderWalletId },
      });

      if (!senderWallet) {
        throw new ApiError(404, 'Sender wallet not found');
      }

      // Verify PIN
      await this.verifyPin(senderWalletId, data.pin);

      // Get receiver's wallet
      const receiverWallet = await tx.wallet.findUnique({
        where: { id: data.receiverWalletId },
      });

      if (!receiverWallet) {
        throw new ApiError(404, 'Receiver wallet not found');
      }

      // Check if sender has sufficient balance
      if (senderWallet.balance < data.amount) {
        throw new ApiError(400, 'Insufficient balance');
      }

      // Check daily and monthly limits
      const stats = await this.getWalletStats(senderWalletId);
      if (stats.remainingDailyLimit < data.amount) {
        throw new ApiError(400, 'Daily transfer limit exceeded');
      }
      if (stats.remainingMonthlyLimit < data.amount) {
        throw new ApiError(400, 'Monthly transfer limit exceeded');
      }

      // Create transfer record
      const transfer = await tx.transfer.create({
        data: {
          amount: data.amount,
          senderWalletId,
          receiverWalletId: receiverWallet.id,
          description: data.description,
          status: 'COMPLETED',
        },
      });

      // Update sender's wallet and create transaction
      await tx.wallet.update({
        where: { id: senderWalletId },
        data: { balance: senderWallet.balance - data.amount },
      });

      await tx.transaction.create({
        data: {
          walletId: senderWalletId,
          type: TransactionType.DEBIT,
          amount: data.amount,
          balance: senderWallet.balance - data.amount,
          description: `Transfer to ${receiverWallet.id}`,
          status: 'COMPLETED',
          metadata: { transferId: transfer.id },
        },
      });

      // Update receiver's wallet and create transaction
      await tx.wallet.update({
        where: { id: receiverWallet.id },
        data: { balance: receiverWallet.balance + data.amount },
      });

      await tx.transaction.create({
        data: {
          walletId: receiverWallet.id,
          type: TransactionType.CREDIT,
          amount: data.amount,
          balance: receiverWallet.balance + data.amount,
          description: `Transfer from ${senderWalletId}`,
          status: 'COMPLETED',
          metadata: { transferId: transfer.id },
        },
      });
    });
  }

  // Update wallet limits
  static async updateLimits(
    walletId: string,
    data: WalletLimitDTO
  ): Promise<Wallet> {
    // Verify PIN first
    await this.verifyPin(walletId, data.pin);

    return prisma.wallet.update({
      where: { id: walletId },
      data: {
        dailyLimit: data.dailyLimit,
        monthlyLimit: data.monthlyLimit,
      },
    });
  }
}