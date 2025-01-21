import { Response } from 'express';
import { WalletService } from '../services/walletService';
import { ApiError } from '../utils/apiError';
import { AuthenticatedRequest } from '../types';
import {
  CreateWalletDTO,
  TransactionDTO,
  TransferDTO,
  WalletLimitDTO,
} from '../types/wallet';

export const walletController = {
  // Create wallet
  createWallet: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const walletData: CreateWalletDTO = req.body;

      const wallet = await WalletService.createWallet(userId, walletData);

      res.status(201).json({
        success: true,
        data: {
          id: wallet.id,
          balance: wallet.balance,
          currency: wallet.currency,
          dailyLimit: wallet.dailyLimit,
          monthlyLimit: wallet.monthlyLimit,
          isActive: wallet.isActive,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error creating wallet',
        });
      }
    }
  },

  // Get wallet details
  getWallet: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const stats = await WalletService.getWalletStats(req.params.walletId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error fetching wallet details',
        });
      }
    }
  },

  // Add money to wallet
  addMoney: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const walletId = req.params.walletId;
      const transactionData: TransactionDTO = req.body;

      const wallet = await WalletService.addMoney(walletId, transactionData);

      res.json({
        success: true,
        data: {
          balance: wallet.balance,
          currency: wallet.currency,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error adding money to wallet',
        });
      }
    }
  },

  // Transfer money
  transfer: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const walletId = req.params.walletId;
      const transferData: TransferDTO = req.body;

      await WalletService.transfer(walletId, transferData);

      res.json({
        success: true,
        message: 'Transfer completed successfully',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error processing transfer',
        });
      }
    }
  },

  // Update wallet limits
  updateLimits: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const walletId = req.params.walletId;
      const limitData: WalletLimitDTO = req.body;

      const wallet = await WalletService.updateLimits(walletId, limitData);

      res.json({
        success: true,
        data: {
          dailyLimit: wallet.dailyLimit,
          monthlyLimit: wallet.monthlyLimit,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Error updating wallet limits',
        });
      }
    }
  },
}; 