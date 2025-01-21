import { Request, Response } from 'express';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import {
  AuthenticatedRequest,
  ApiResponse,
  KYCData,
  ProfileData,
  SafeUser,
  CreateUserRequest
} from '../types';

const prisma = new PrismaClient();

// Extend Express Request to include user
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

const sanitizeUser = (user: PrismaUser & {
  kyc?: { id: string; userId: string; panNumber: string; dateOfBirth: Date; status: string; createdAt: Date; updatedAt: Date; } | null;
  wallet?: { id: string; balance: number; currency: string; } | null;
  gamification?: { id: string; level: number; points: number; } | null;
}): SafeUser => ({
  id: user.id,
  phoneNumber: user.phoneNumber,
  firstName: user.firstName,
  lastName: user.lastName,
  isVerified: user.isVerified,
  role: user.role
});

export const createUser = async (
  req: Request<{}, {}, CreateUserRequest>,
  res: Response
): Promise<void> => {
  try {
    const { phoneNumber, firstName, lastName, email } = req.body;
    const user = await prisma.user.create({
      data: {
        phoneNumber,
        firstName,
        lastName,
        email
      }
    });
    res.status(201).json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    console.error('Create User Error:', error);
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Error creating user' });
    }
  }
};

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        isVerified: true,
        role: true,
        createdAt: true
      }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ success: false, error: 'Error fetching users' });
  }
};

export const userController = {
  // Get user profile
  getProfile: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          kyc: true,
          wallet: true,
          gamification: true,
        },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      res.json({ success: true, data: sanitizeUser(user) });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  },

  // Update user profile
  updateProfile: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<SafeUser>>
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const profileData: ProfileData = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: profileData,
      });

      res.json({ success: true, data: sanitizeUser(updatedUser) });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  },

  // Update KYC information
  updateKYC: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const kycData: KYCData = req.body;

      const kyc = await prisma.kYC.upsert({
        where: { userId },
        update: {
          ...kycData,
          dateOfBirth: new Date(kycData.dateOfBirth),
          status: 'PENDING',
        },
        create: {
          ...kycData,
          userId,
          dateOfBirth: new Date(kycData.dateOfBirth),
        },
      });

      res.json({ success: true, data: kyc });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  },

  // Get user's KYC status
  getKYCStatus: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const userId = req.user.id;

      const kyc = await prisma.kYC.findUnique({
        where: { userId },
      });

      if (!kyc) {
        throw new ApiError(404, 'KYC information not found');
      }

      res.json({ success: true, data: kyc });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    }
  },
}; 