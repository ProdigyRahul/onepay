"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kycController = void 0;
const client_1 = require("@prisma/client");
const apiError_1 = require("../utils/apiError");
const promises_1 = __importDefault(require("fs/promises"));
const prisma = new client_1.PrismaClient();
exports.kycController = {
    uploadPanCard: async (req, res) => {
        try {
            const userId = req.user.id;
            const file = req.file;
            if (!file) {
                throw new apiError_1.ApiError(400, 'No file uploaded');
            }
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
                    panCardPath: file.path,
                    status: client_1.KYCStatus.PENDING_VERIFICATION,
                    panNumber: (existingKyc === null || existingKyc === void 0 ? void 0 : existingKyc.panNumber) || 'PENDING',
                    dateOfBirth: (existingKyc === null || existingKyc === void 0 ? void 0 : existingKyc.dateOfBirth) || new Date(),
                },
                update: {
                    panCardPath: file.path,
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
                    message: 'PAN card uploaded successfully',
                    status: updatedKyc.status,
                },
            });
        }
        catch (error) {
            if (req.file) {
                await promises_1.default.unlink(req.file.path).catch(console.error);
            }
            throw error;
        }
    },
    getKycStatus: async (req, res) => {
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
    updateKycStatus: async (req, res) => {
        const { userId, status, remarks } = req.body;
        if (req.user.role !== client_1.Role.ADMIN) {
            throw new apiError_1.ApiError(403, 'Only admins can update KYC status');
        }
        if (!Object.values(client_1.KYCStatus).includes(status)) {
            throw new apiError_1.ApiError(400, 'Invalid KYC status');
        }
        const kyc = await prisma.kYC.findUnique({
            where: { userId },
            select: {
                id: true,
                status: true,
            },
        });
        if (!kyc) {
            throw new apiError_1.ApiError(404, 'KYC record not found');
        }
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
//# sourceMappingURL=kycController.js.map