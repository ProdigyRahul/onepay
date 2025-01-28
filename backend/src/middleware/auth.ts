import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { prisma } from '../lib/prisma';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      throw new ApiError(401, 'Invalid token');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(401).json({ success: false, error: 'Authentication failed' });
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to access this route',
      });
      return;
    }

    next();
  };
}; 