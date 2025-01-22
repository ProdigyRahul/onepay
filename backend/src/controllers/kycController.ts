import { Response } from 'express';
import { PrismaClient, KYCStatus, Role } from '@prisma/client';
import { AuthenticatedRequest, ApiResponse, FileRequest } from '../types';
import { ApiError } from '../utils/apiError';
import fs from 'fs/promises';

const prisma = new PrismaClient();

export const kycController = {
  // Upload PAN card document
  uploadPanCard: async (
    req: FileRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const file = req.file;

      if (!file) {
        throw new ApiError(400, 'No file uploaded');
      }

      // First try to get existing KYC record
      const existingKyc = await prisma.kYC.findUnique({
        where: { userId },
        select: {
          panNumber: true,
          dateOfBirth: true,
        },
      });

      // Create or update KYC record
      const updatedKyc = await prisma.kYC.upsert({
        where: { userId },
        create: {
          userId,
          panCardPath: file.path,
          status: KYCStatus.PENDING_VERIFICATION,
          panNumber: existingKyc?.panNumber || 'PENDING', // Temporary value until user provides it
          dateOfBirth: existingKyc?.dateOfBirth || new Date(), // Temporary value until user provides it
        },
        update: {
          panCardPath: file.path,
          status: KYCStatus.PENDING_VERIFICATION,
          verifiedAt: null,
          remarks: null,
        },
        select: {
          status: true,
          panCardPath: true,
        },
      });

      res.json({
        success: true,
        data: {
          message: 'PAN card uploaded successfully',
          status: updatedKyc.status,
        },
      });
    } catch (error) {
      // Delete uploaded file if there's an error
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      throw error;
    }
  },

  // Get KYC status
  getKycStatus: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    const userId = req.user.id;

    const kyc = await prisma.kYC.findUnique({
      where: { userId },
      select: {
        status: true,
        panNumber: true,
        dateOfBirth: true,
        panCardPath: true,
        remarks: true,
      },
    });

    // If KYC record doesn't exist, return null status instead of error
    if (!kyc) {
      res.json({
        success: true,
        data: {
          status: null,
          panNumber: null,
          dateOfBirth: null,
          hasDocument: false,
          remarks: null,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        status: kyc.status,
        panNumber: kyc.panNumber,
        dateOfBirth: kyc.dateOfBirth,
        hasDocument: !!kyc.panCardPath,
        remarks: kyc.remarks,
      },
    });
  },

  // Admin: Update KYC status
  updateKycStatus: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    const { userId, status, remarks } = req.body;

    // Check if user is admin
    if (req.user.role !== Role.ADMIN) {
      throw new ApiError(403, 'Only admins can update KYC status');
    }

    // Validate status
    if (!Object.values(KYCStatus).includes(status)) {
      throw new ApiError(400, 'Invalid KYC status');
    }

    // Get KYC record
    const kyc = await prisma.kYC.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!kyc) {
      throw new ApiError(404, 'KYC record not found');
    }

    // Update KYC status
    const updatedKyc = await prisma.kYC.update({
      where: { userId },
      data: {
        status,
        remarks,
        verifiedAt: status === KYCStatus.VERIFIED ? new Date() : null,
      },
    });

    // If verified, update user's onboarding status
    if (status === KYCStatus.VERIFIED) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          onboardingComplete: true,
        },
      });
    }

    res.json({
      success: true,
      data: {
        message: 'KYC status updated successfully',
        status: updatedKyc.status,
      },
    });
  },
};
