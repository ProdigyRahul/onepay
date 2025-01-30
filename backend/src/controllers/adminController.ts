import { Response } from 'express';
import { PrismaClient, KYCStatus } from '@prisma/client';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { ApiError } from '../utils/apiError';

const prisma = new PrismaClient();

export const adminController = {
  // Get all pending KYC applications
  getPendingKycApplications: async (
    _req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const pendingApplications = await prisma.kYC.findMany({
        where: {
          status: KYCStatus.PENDING_VERIFICATION,
        },
        select: {
          id: true,
          userId: true,
          panNumber: true,
          dateOfBirth: true,
          panCardPath: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      res.json({
        success: true,
        data: {
          applications: pendingApplications,
        },
      });
    } catch (error) {
      console.error('Error in getPendingKycApplications:', error);
      throw new ApiError(500, 'Failed to fetch pending KYC applications');
    }
  },

  // Update KYC status (approve/reject)
  updateKycStatus: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const { status, remarks } = req.body;

      // Update KYC status
      const updatedKyc = await prisma.kYC.update({
        where: { userId },
        data: {
          status,
          remarks,
          verifiedAt: status === KYCStatus.VERIFIED ? new Date() : null,
        },
      });

      // If KYC is verified, update user's verification status
      if (status === KYCStatus.VERIFIED) {
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
          userId,
          status: updatedKyc.status,
          remarks: updatedKyc.remarks,
          verifiedAt: updatedKyc.verifiedAt,
        },
      });
    } catch (error) {
      console.error('Error in updateKycStatus:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to update KYC status');
    }
  },
};
