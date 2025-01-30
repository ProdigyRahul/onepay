import { Response } from 'express';
import { Prisma, IncomeRange as PrismaIncomeRange, SpendingHabit, UserGoal } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { AuthenticatedRequest, ProfileData, FinancialProfileData, ApiResponse } from '../types';
import { prisma } from '../lib/prisma';

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
      console.log('=== Update Age Start ===');
      console.log('User:', req.user);
      console.log('Request body:', req.body);
      
      const userId = req.user.id;
      const { age } = req.body;
      
      console.log('Parsed age:', age);

      // First check if user has KYC record
      console.log('Fetching user with KYC...');
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { kyc: true },
      });
      console.log('Existing user:', existingUser);

      if (!existingUser?.kyc) {
        console.error('KYC record not found');
        throw new ApiError(400, 'Please complete profile with PAN number first');
      }

      // Calculate date of birth from age
      console.log('Calculating date of birth...');
      const today = new Date();
      const birthYear = today.getFullYear() - age;
      // Set to middle of the year to avoid invalid date issues
      const dateOfBirth = new Date(birthYear, 6, 1);
      console.log('Calculated date of birth:', dateOfBirth);

      console.log('Updating user...');
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          kyc: {
            update: {
              dateOfBirth,
            },
          },
        },
        include: {
          kyc: true,
        },
      });
      console.log('Updated user:', user);

      // Since we checked for KYC existence above and we're including it in the query
      // TypeScript should know it exists, but let's add a runtime check just to be safe
      if (!user.kyc) {
        console.error('KYC record not found after update');
        throw new ApiError(500, 'KYC record not found after update');
      }

      console.log('Sending response...');
      res.json({
        success: true,
        message: 'Age updated successfully',
        data: {
          age,
          dateOfBirth: user.kyc.dateOfBirth,
        },
      });
      console.log('=== Update Age End ===');
    } catch (error) {
      console.error('=== Update Age Error ===');
      console.error('Error details:', error);
      
      if (error instanceof ApiError) {
        console.error('API Error:', {
          statusCode: error.statusCode,
          message: error.message
        });
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Unexpected error:', error);
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

  // Update primary goal
  updatePrimaryGoal: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const { primaryGoal } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          financialProfile: {
            upsert: {
              create: {
                primaryGoal,
                incomeRange: PrismaIncomeRange.RANGE_0_25000,
                targetSpendingPercentage: 0,
                spendingHabit: SpendingHabit.SPEND_SOMETIMES,
                targetSavingsPercentage: 0,
              },
              update: {
                primaryGoal,
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
        data: {
          primaryGoal: user.financialProfile?.primaryGoal,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Primary Goal Update Error:', error);
        res.status(500).json({
          success: false,
          error: 'Error updating primary goal',
        });
      }
    }
  },

  // Update income range
  updateIncomeRange: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const { incomeRange } = req.body;
      
      console.log('Received income range update request:', {
        userId,
        body: req.body,
        incomeRange,
        validRanges: Object.values(PrismaIncomeRange)
      });

      if (!Object.values(PrismaIncomeRange).includes(incomeRange)) {
        console.error('Invalid income range:', {
          received: incomeRange,
          validOptions: Object.values(PrismaIncomeRange)
        });
        throw new ApiError(400, `Invalid income range. Must be one of: ${Object.values(PrismaIncomeRange).join(', ')}`);
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          financialProfile: {
            upsert: {
              create: {
                incomeRange,
                targetSpendingPercentage: 0,
                spendingHabit: SpendingHabit.SPEND_SOMETIMES,
                targetSavingsPercentage: 0,
                primaryGoal: UserGoal.EVERYDAY_PAYMENTS,
              },
              update: {
                incomeRange,
              },
            },
          },
        },
        include: {
          financialProfile: true,
        },
      });

      console.log('Income range updated successfully:', {
        userId,
        newIncomeRange: user.financialProfile?.incomeRange
      });

      res.json({
        success: true,
        data: {
          incomeRange: user.financialProfile?.incomeRange,
        },
      });
    } catch (error) {
      console.error('Income range update error:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Income Range Update Error:', error);
        res.status(500).json({
          success: false,
          error: 'Error updating income range',
        });
      }
    }
  },

  // Update spending habits
  updateSpendingHabits: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const { spendingHabit, targetSpendingPercentage } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          financialProfile: {
            upsert: {
              create: {
                spendingHabit,
                targetSpendingPercentage,
                targetSavingsPercentage: 100 - targetSpendingPercentage,
                primaryGoal: UserGoal.EVERYDAY_PAYMENTS,
                incomeRange: PrismaIncomeRange.RANGE_0_25000,
              },
              update: {
                spendingHabit,
                targetSpendingPercentage,
                targetSavingsPercentage: 100 - targetSpendingPercentage,
              },
            },
          },
        },
        include: {
          financialProfile: true,
          kyc: true,
        },
      });

      // Check if all required fields are set
      const isOnboardingComplete = !!(
        user.firstName &&
        user.lastName &&
        user.email &&
        user.kyc?.panNumber &&
        user.kyc?.dateOfBirth &&
        user.financialProfile?.primaryGoal &&
        user.financialProfile?.incomeRange &&
        user.financialProfile?.spendingHabit &&
        user.kyc?.status === 'VERIFIED' // Add KYC verification check
      );

      // Update user's onboarding status if complete
      if (isOnboardingComplete) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            isVerified: true,
          },
        });
      }

      res.json({
        success: true,
        data: {
          spendingHabit: user.financialProfile?.spendingHabit,
          targetSpendingPercentage: user.financialProfile?.targetSpendingPercentage,
          targetSavingsPercentage: user.financialProfile?.targetSavingsPercentage,
          isOnboardingComplete,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        console.error('Spending Habits Update Error:', error);
        res.status(500).json({
          success: false,
          error: 'Error updating spending habits',
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

      // Check if spending habits are set - only need spendingHabit since we don't use percentage anymore
      const spendingHabitsSet = !!user.financialProfile?.spendingHabit;

      // Check overall completion - removed targetSpendingPercentage check since we don't use it
      const onboardingComplete = !!(
        user.firstName &&
        user.lastName &&
        user.email &&
        user.kyc?.panNumber &&
        user.kyc?.dateOfBirth &&
        user.financialProfile?.primaryGoal &&
        user.financialProfile?.incomeRange &&
        user.financialProfile?.spendingHabit &&
        user.kyc?.status === 'VERIFIED' // Add KYC verification check
      );

      const status = {
        profileCompleted: !!(user.firstName && user.lastName && user.email && user.kyc?.panNumber),
        ageVerified: !!user.kyc?.dateOfBirth,
        primaryGoalSet: !!user.financialProfile?.primaryGoal,
        incomeRangeSet: !!user.financialProfile?.incomeRange,
        spendingHabitsSet,
        onboardingComplete,
        kycStatus: user.kyc?.status || null, // Add KYC status to response
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