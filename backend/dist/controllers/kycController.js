"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kycController = void 0;
const client_1 = require("@prisma/client");
const apiError_1 = require("../utils/apiError");
const storageService_1 = require("../services/storageService");
const prisma = new client_1.PrismaClient();
exports.kycController = {
    uploadPanCard: async (req, res) => {
        try {
            const userId = req.user.id;
            const file = req.file;
            if (!file) {
                throw new apiError_1.ApiError(400, 'No file uploaded');
            }
            const storageResponse = await storageService_1.storageService.uploadFile(file);
            const existingKyc = await prisma.kYC.findUnique({
                where: { userId },
                select: {
                    panNumber: true,
                    dateOfBirth: true,
                },
            });
            const updatedKyc = await prisma.kYC.upsert({
                where: { userId },
                create: {
                    userId,
                    panCardPath: storageResponse.file.url,
                    status: client_1.KYCStatus.PENDING_VERIFICATION,
                    panNumber: (existingKyc === null || existingKyc === void 0 ? void 0 : existingKyc.panNumber) || 'PENDING',
                    dateOfBirth: (existingKyc === null || existingKyc === void 0 ? void 0 : existingKyc.dateOfBirth) || new Date(),
                },
                update: {
                    panCardPath: storageResponse.file.url,
                    status: client_1.KYCStatus.PENDING_VERIFICATION,
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
        }
        catch (error) {
            console.error('Error in uploadPanCard:', error);
            if (error instanceof apiError_1.ApiError) {
                throw error;
            }
            throw new apiError_1.ApiError(500, 'Failed to upload PAN card');
        }
    },
    getKycStatus: async (req, res) => {
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
                        status: client_1.KYCStatus.PENDING_VERIFICATION,
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
        }
        catch (error) {
            console.error('Error in getKycStatus:', error);
            throw new apiError_1.ApiError(500, 'Failed to get KYC status');
        }
    },
    updateKycStatus: async (req, res) => {
        try {
            const adminId = req.user.id;
            const { userId, status, remarks } = req.body;
            const admin = await prisma.user.findUnique({
                where: { id: adminId },
                select: { role: true },
            });
            if ((admin === null || admin === void 0 ? void 0 : admin.role) !== client_1.Role.ADMIN) {
                throw new apiError_1.ApiError(403, 'Only admins can update KYC status');
            }
            const updatedKyc = await prisma.kYC.update({
                where: { userId },
                data: {
                    status,
                    remarks,
                    verifiedAt: status === client_1.KYCStatus.VERIFIED ? new Date() : null,
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
        }
        catch (error) {
            console.error('Error in updateKycStatus:', error);
            if (error instanceof apiError_1.ApiError) {
                throw error;
            }
            throw new apiError_1.ApiError(500, 'Failed to update KYC status');
        }
    },
};
//# sourceMappingURL=kycController.js.map