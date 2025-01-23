import { Response } from 'express';
import { PrismaClient, KYCStatus, Role } from '@prisma/client';
import { AuthenticatedRequest, ApiResponse, FileRequest } from '../types';
import { ApiError } from '../utils/apiError';
import { storageService } from '../services/storageService';

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

      // Upload file to storage service
      const storageResponse = await storageService.uploadFile(file);

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
          panCardPath: storageResponse.file.url,
          status: KYCStatus.PENDING_VERIFICATION,
          panNumber: existingKyc?.panNumber || 'PENDING', // Temporary value until user provides it
          dateOfBirth: existingKyc?.dateOfBirth || new Date(), // Temporary value until user provides it
        },
        update: {
          panCardPath: storageResponse.file.url,
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
          status: updatedKyc.status,
          documentUrl: updatedKyc.panCardPath,
        },
      });
    } catch (error) {
      console.error('Error in uploadPanCard:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to upload PAN card');
    }
  },

  // Get KYC status
  getKycStatus: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const userId = req.user.id;

      const kyc = await prisma.kYC.findUnique({
        where: { userId },
        select: {
          status: true,
          panCardPath: true,
          panNumber: true,
          dateOfBirth: true,
          verifiedAt: true,
          remarks: true,
        },
      });

      if (!kyc) {
        res.json({
          success: true,
          data: {
            status: KYCStatus.PENDING_VERIFICATION,
            documents: [],
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          status: kyc.status,
          documents: [
            {
              type: 'PAN_CARD',
              status: kyc.status,
              documentUrl: kyc.panCardPath,
              panNumber: kyc.panNumber,
              dateOfBirth: kyc.dateOfBirth,
              verifiedAt: kyc.verifiedAt,
              remarks: kyc.remarks,
            },
          ],
        },
      });
    } catch (error) {
      console.error('Error in getKycStatus:', error);
      throw new ApiError(500, 'Failed to get KYC status');
    }
  },

  // Admin: Update KYC status
  updateKycStatus: async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<any>>
  ): Promise<void> => {
    try {
      const adminId = req.user.id;
      const { userId, status, remarks } = req.body;

      // Verify admin role
      const admin = await prisma.user.findUnique({
        where: { id: adminId },
        select: { role: true },
      });

      if (admin?.role !== Role.ADMIN) {
        throw new ApiError(403, 'Only admins can update KYC status');
      }

      const updatedKyc = await prisma.kYC.update({
        where: { userId },
        data: {
          status,
          remarks,
          verifiedAt: status === KYCStatus.VERIFIED ? new Date() : null,
        },
      });

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
