"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.getUsers = exports.createUser = void 0;
const client_1 = require("@prisma/client");
const apiError_1 = require("../utils/apiError");
const prisma = new client_1.PrismaClient();
const sanitizeUser = (user) => ({
    id: user.id,
    phoneNumber: user.phoneNumber,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isVerified: user.isVerified,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});
const createUser = async (req, res) => {
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
    }
    catch (error) {
        console.error('Create User Error:', error);
        if (error instanceof Error) {
            res.status(400).json({ success: false, error: error.message });
        }
        else {
            res.status(500).json({ success: false, error: 'Error creating user' });
        }
    }
};
exports.createUser = createUser;
const getUsers = async (_req, res) => {
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
    }
    catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ success: false, error: 'Error fetching users' });
    }
};
exports.getUsers = getUsers;
exports.userController = {
    getProfile: async (req, res) => {
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
                throw new apiError_1.ApiError(404, 'User not found');
            }
            res.json({ success: true, data: sanitizeUser(user) });
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                res.status(error.statusCode).json({ success: false, error: error.message });
            }
            else {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        }
    },
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const profileData = req.body;
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: profileData,
            });
            res.json({ success: true, data: sanitizeUser(updatedUser) });
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                res.status(error.statusCode).json({ success: false, error: error.message });
            }
            else {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        }
    },
    updateKYC: async (req, res) => {
        try {
            const userId = req.user.id;
            const kycData = req.body;
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
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                res.status(error.statusCode).json({ success: false, error: error.message });
            }
            else {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        }
    },
    getKYCStatus: async (req, res) => {
        try {
            const userId = req.user.id;
            const kyc = await prisma.kYC.findUnique({
                where: { userId },
            });
            if (!kyc) {
                throw new apiError_1.ApiError(404, 'KYC information not found');
            }
            res.json({ success: true, data: kyc });
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                res.status(error.statusCode).json({ success: false, error: error.message });
            }
            else {
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        }
    },
};
//# sourceMappingURL=userController.js.map