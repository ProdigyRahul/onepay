"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const client_1 = require("@prisma/client");
const apiError_1 = require("../utils/apiError");
const prisma = new client_1.PrismaClient();
exports.adminController = {
    getPendingKycApplications: async (_req, res) => {
        try {
            const pendingApplications = await prisma.kYC.findMany({
                where: {
                    status: client_1.KYCStatus.PENDING_VERIFICATION,
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
        }
        catch (error) {
            console.error('Error in getPendingKycApplications:', error);
            throw new apiError_1.ApiError(500, 'Failed to fetch pending KYC applications');
        }
    },
    updateKycStatus: async (req, res) => {
        try {
            const { userId } = req.params;
            const { status, remarks } = req.body;
            const updatedKyc = await prisma.kYC.update({
                where: { userId },
                data: {
                    status,
                    remarks,
                    verifiedAt: status === client_1.KYCStatus.VERIFIED ? new Date() : null,
                },
            });
            if (status === client_1.KYCStatus.VERIFIED) {
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
//# sourceMappingURL=adminController.js.map