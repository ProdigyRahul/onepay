import { TransactionType, TransactionStatus, KYCStatus } from '@prisma/client';

export enum WalletType {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT',
  BUSINESS = 'BUSINESS'
}

export interface CreateWalletDTO {
  pin: string;
  type: WalletType;
  currency?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
}

export interface WalletPinDTO {
  pin: string;
}

export interface TransactionDTO {
  id: string;
  transactionId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  status: TransactionStatus;
  createdAt: Date;
  senderWalletId: string;
  receiverWalletId: string;
}

export interface TransferDTO {
  toWalletId: string;
  amount: number;
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
  firstName: string;
  lastName: string;
}

export interface RecentTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  createdAt: Date;
}

export interface WalletStats {
  id: string;
  balance: number;
  currency: string;
  type: WalletType;
  isActive: boolean;
  blockedUntil?: Date;
  dailyLimit: number;
  monthlyLimit: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  recentTransactions: RecentTransaction[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    kycStatus: KYCStatus;
  };
  qrCodeData: string;
}