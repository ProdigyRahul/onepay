import { TransactionType, Wallet, TransactionStatus, KYCStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/apiError';
import { WalletType } from '../types/wallet';
import { prisma } from '../lib/prisma';
import { generateTransactionId, generateAccountNumber } from '../utils/transactionUtils';
import {
  CreateWalletDTO,
  TransactionDTO,
  WalletStats,
  RecentTransaction,
  WalletResponse
} from '../types/wallet';

export class WalletService {
  /**
   * Create a new wallet
   */
  static async createWallet(userId: string, data: CreateWalletDTO): Promise<Wallet> {
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (existingWallet) {
      throw new ApiError(400, 'User already has a wallet');
    }

    const accountNumber = await generateAccountNumber();
    const hashedPin = await bcrypt.hash(data.pin, 10);

    return await prisma.wallet.create({
      data: {
        userId,
        accountNumber,
        pin: hashedPin,
        currency: data.currency || 'INR',
        type: data.type || WalletType.SAVINGS,
        dailyLimit: data.dailyLimit || 10000,
        monthlyLimit: data.monthlyLimit || 100000
      }
    });
  }

  /**
   * Get wallet stats including user info for dashboard
   */
  static async getWalletStats(userId: string): Promise<WalletStats> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            kyc: {
              select: {
                status: true
              }
            }
          }
        },
        transactions: {
          where: {
            status: TransactionStatus.COMPLETED
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5,
          select: {
            id: true,
            type: true,
            amount: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    // Calculate monthly stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { senderWalletId: wallet.id },
          { receiverWalletId: wallet.id }
        ],
        status: TransactionStatus.COMPLETED,
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    const monthlyStats = monthlyTransactions.reduce((acc, transaction) => {
      if (transaction.receiverWalletId === wallet.id) {
        acc.income += transaction.amount;
      } else {
        acc.expenses += transaction.amount;
      }
      return acc;
    }, { income: 0, expenses: 0 });

    // Generate QR code data
    const qrData = {
      walletId: wallet.id,
      userId,
      name: `${wallet.user.firstName} ${wallet.user.lastName}`,
      type: 'ONEPAY_WALLET'
    };

    const recentTransactions: RecentTransaction[] = wallet.transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      status: t.status,
      createdAt: t.createdAt
    }));

    return {
      id: wallet.id,
      balance: wallet.balance,
      currency: wallet.currency,
      type: wallet.type as WalletType,
      isActive: !wallet.isBlocked,
      blockedUntil: wallet.blockedUntil || undefined,
      dailyLimit: wallet.dailyLimit,
      monthlyLimit: wallet.monthlyLimit,
      monthlyIncome: monthlyStats.income,
      monthlyExpenses: monthlyStats.expenses,
      recentTransactions,
      user: {
        firstName: wallet.user.firstName,
        lastName: wallet.user.lastName,
        email: wallet.user.email ?? '',
        phoneNumber: wallet.user.phoneNumber,
        kycStatus: wallet.user.kyc?.status ?? KYCStatus.PENDING
      },
      qrCodeData: Buffer.from(JSON.stringify(qrData)).toString('base64')
    };
  }

  /**
   * Get wallet balance and basic info
   */
  static async getWalletBalance(userId: string): Promise<WalletResponse> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    return {
      id: wallet.id,
      balance: wallet.balance,
      currency: wallet.currency,
      dailyLimit: wallet.dailyLimit,
      monthlyLimit: wallet.monthlyLimit,
      isActive: !wallet.isBlocked,
      isBlocked: wallet.isBlocked,
      blockedUntil: wallet.blockedUntil ? new Date(wallet.blockedUntil) : undefined,
      firstName: wallet.user.firstName,
      lastName: wallet.user.lastName
    };
  }

  /**
   * Transfer money between wallets
   */
  static async transfer(
    fromUserId: string,
    toWalletId: string,
    amount: number,
    description: string
  ): Promise<TransactionDTO> {
    const fromWallet = await prisma.wallet.findUnique({
      where: { userId: fromUserId }
    });

    if (!fromWallet) {
      throw new ApiError(404, 'Sender wallet not found');
    }

    const toWallet = await prisma.wallet.findUnique({
      where: { id: toWalletId }
    });

    if (!toWallet) {
      throw new ApiError(404, 'Receiver wallet not found');
    }

    if (fromWallet.isBlocked) {
      throw new ApiError(403, 'Sender wallet is blocked');
    }

    if (toWallet.isBlocked) {
      throw new ApiError(403, 'Receiver wallet is blocked');
    }

    if (fromWallet.balance < amount) {
      throw new ApiError(400, 'Insufficient balance');
    }

    const transactionId = await generateTransactionId();

    const transaction = await prisma.$transaction(async (prisma) => {
      // Debit from sender
      await prisma.wallet.update({
        where: { id: fromWallet.id },
        data: { balance: { decrement: amount } }
      });

      // Credit to receiver
      await prisma.wallet.update({
        where: { id: toWallet.id },
        data: { balance: { increment: amount } }
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          transactionId,
          type: TransactionType.DEBIT,
          amount,
          description,
          status: TransactionStatus.COMPLETED,
          walletId: fromWallet.id,
          senderWalletId: fromWallet.id,
          receiverWalletId: toWallet.id
        }
      });

      return {
        id: transaction.id,
        transactionId: transaction.transactionId,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description || undefined,
        status: transaction.status,
        createdAt: transaction.createdAt,
        senderWalletId: transaction.senderWalletId!,
        receiverWalletId: transaction.receiverWalletId!
      };
    });

    return transaction;
  }
}