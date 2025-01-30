import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/apiError';

/**
 * Middleware to verify wallet ownership
 * Throws error if:
 * 1. Wallet doesn't exist
 * 2. Wallet doesn't belong to the authenticated user
 * 3. Wallet is inactive
 */
export const verifyWalletOwnership = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const walletId = req.params.walletId;
    const userId = req.user.id;

    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    if (wallet.userId !== userId) {
      throw new ApiError(403, 'You do not have permission to access this wallet');
    }

    if (!wallet.isActive) {
      throw new ApiError(400, 'This wallet is inactive');
    }

    // Add wallet to request for use in subsequent middleware/controller
    req.wallet = wallet;
    next();
  } catch (error) {
    next(error);
  }
};
