import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { WalletService } from '../services/walletService';
import { UserService } from '../services/userService';
import { ApiError } from '../utils/apiError';

export const profileController = {
  // Get user profile with wallet info
  getProfile: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const walletStats = await WalletService.getWalletStats(userId);

      res.status(200).json({
        success: true,
        data: walletStats,
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
          error: 'Error fetching profile',
        });
      }
    }
  },

  // Update user profile (email only)
  updateProfile: async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const { email } = req.body;

      // Validate email
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ApiError(400, 'Invalid email format');
      }

      const updatedUser = await UserService.updateUser(userId, { email });

      res.status(200).json({
        success: true,
        data: {
          email: updatedUser.email,
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
          error: 'Error updating profile',
        });
      }
    }
  },
};
