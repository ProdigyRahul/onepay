import { Response } from 'express';
import { WalletService } from '../services/walletService';
import { ApiError } from '../utils/apiError';
import { AuthenticatedRequest } from '../types';

export const walletController = {
  // Create wallet
  createWallet: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const walletData: any = req.body;

      const wallet = await WalletService.createWallet(userId, walletData);

      res.status(201).json({
        success: true,
        data: {
          id: wallet.id,
          balance: wallet.balance,
          currency: wallet.currency,
          dailyLimit: wallet.dailyLimit,
          monthlyLimit: wallet.monthlyLimit,
          isActive: !wallet.isBlocked,
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
      const stats = await WalletService.getWalletStats(req.user.id);

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

  // Get wallet balance
  getWalletBalance: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const wallet = await WalletService.getWalletBalance(req.user.id);

      res.json({
        success: true,
        data: wallet,
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
          error: 'Error fetching wallet balance',
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
      const userId = req.user.id;
      const transferData: any = req.body;

      const transaction = await WalletService.transfer(
        userId,
        transferData.toWalletId,
        transferData.amount,
        transferData.description || 'Transfer'
      );

      res.json({
        success: true,
        data: transaction,
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
          error: 'Error transferring money',
        });
      }
    }
  },

  // Get wallet stats for dashboard
  getWalletStats: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const stats = await WalletService.getWalletStats(req.user.id);

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
          error: 'Error fetching wallet stats',
        });
      }
    }
  },
};