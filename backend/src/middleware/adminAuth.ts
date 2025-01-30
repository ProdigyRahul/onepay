import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ApiError } from '../utils/apiError';
import { Role } from '@prisma/client';

export const adminAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user.role !== Role.ADMIN) {
      throw new ApiError(403, 'Access denied. Admin privileges required.');
    }
    next();
  } catch (error) {
    next(error);
  }
};
