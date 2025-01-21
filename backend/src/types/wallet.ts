import { TransactionType, TransactionStatus, TransferStatus } from '@prisma/client';

export interface CreateWalletDTO {
  pin: string;
  currency?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
}

export interface WalletPinDTO {
  pin: string;
}

export interface TransactionDTO {
  amount: number;
  description?: string;
  type: TransactionType;
  metadata?: Record<string, any>;
}

export interface TransferDTO {
  amount: number;
  receiverWalletId: string;
  description?: string;
  pin: string;
}

export interface WalletResponse {
  id: string;
  balance: number;
  currency: string;
  dailyLimit: number;
  monthlyLimit: number;
  isActive: boolean;
  isBlocked: boolean;
  blockedUntil?: Date;
}

export interface TransactionResponse {
  id: string;
  type: TransactionType;
  amount: number;
  balance: number;
  description?: string;
  status: TransactionStatus;
  createdAt: Date;
}

export interface TransferResponse {
  id: string;
  amount: number;
  description?: string;
  status: TransferStatus;
  createdAt: Date;
  senderWalletId: string;
  receiverWalletId: string;
}

export interface WalletLimitDTO {
  dailyLimit?: number;
  monthlyLimit?: number;
  pin: string;
}

export interface WalletStats {
  dailySpent: number;
  monthlySpent: number;
  remainingDailyLimit: number;
  remainingMonthlyLimit: number;
  totalBalance: number;
} 