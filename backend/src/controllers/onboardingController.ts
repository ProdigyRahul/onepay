import { Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { AuthenticatedRequest, ProfileData, KYCData, FinancialProfileData, ApiResponse } from '../types';

const prisma = new PrismaClient();

export const onboardingController = {
  // Update user profile (name, email, PAN)
  updateProfile: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const profileData: ProfileData = req.body;

      const updateData: Prisma.UserUpdateInput = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
      };

      if (profileData.panNumber) {
        updateData.kyc = {
          upsert: {
            create: {
              panNumber: profileData.panNumber,
              dateOfBirth: new Date(), // Temporary date, will be updated in updateAge
              status: 'PENDING',
            },
            update: {
              panNumber: profileData.panNumber,
              status: 'PENDING',
            },
          },
        };
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: {
          kyc: true,
        },
      });

      res.json({
        success: true,
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          panNumber: user.kyc?.panNumber,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Profile Update Error:', error);
        res.status(500).json({
          success: false,
          error: 'Error updating profile',
        });
      }
    }
  },

  // Update age information
  updateAge: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const { dateOfBirth }: KYCData = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          kyc: {
            update: {
              dateOfBirth: new Date(dateOfBirth),
            },
          },
        },
        include: {
          kyc: true,
        },
      });

      if (!user.kyc) {
        throw new ApiError(400, 'Please complete profile with PAN number first');
      }

      res.json({
        success: true,
        data: {
          dateOfBirth: user.kyc.dateOfBirth,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Age Update Error:', error);
        res.status(500).json({
          success: false,
          error: 'Error updating age',
        });
      }
    }
  },

  // Update financial profile
  updateFinancialProfile: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const financialData: FinancialProfileData = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          financialProfile: {
            upsert: {
              create: {
                incomeRange: financialData.incomeRange,
                targetSpendingPercentage: financialData.targetSpendingPercentage,
                spendingHabit: financialData.spendingHabit,
                targetSavingsPercentage: financialData.targetSavingsPercentage,
                primaryGoal: financialData.primaryGoal,
              },
              update: {
                incomeRange: financialData.incomeRange,
                targetSpendingPercentage: financialData.targetSpendingPercentage,
                spendingHabit: financialData.spendingHabit,
                targetSavingsPercentage: financialData.targetSavingsPercentage,
                primaryGoal: financialData.primaryGoal,
              },
            },
          },
        },
        include: {
          financialProfile: true,
        },
      });

      res.json({
        success: true,
        data: user.financialProfile,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Financial Profile Update Error:', error);
        res.status(500).json({
          success: false,
          error: 'Error updating financial profile',
        });
      }
    }
  },

  // Get onboarding status
  getStatus: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          kyc: true,
          financialProfile: true,
        },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      const status = {
        profileCompleted: !!(user.firstName && user.lastName && user.email && user.kyc?.panNumber),
        ageVerified: !!user.kyc?.dateOfBirth,
        financialProfileCompleted: !!user.financialProfile,
        onboardingComplete: !!(
          user.firstName &&
          user.lastName &&
          user.email &&
          user.kyc?.panNumber &&
          user.kyc?.dateOfBirth &&
          user.financialProfile
        ),
      };

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Status Check Error:', error);
        res.status(500).json({
          success: false,
          error: 'Error checking onboarding status',
        });
      }
    }
  },
}; 