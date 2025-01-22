"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.generateOTP = void 0;
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const twilioService_1 = require("../services/twilioService");
const prisma = new client_1.PrismaClient();
const generateOTP = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const phoneRegex = /^\+\d{10,15}$/;
        if (!phoneRegex.test(phoneNumber)) {
            res.status(400).json({
                success: false,
                error: 'Invalid phone number format. Must start with + and contain 10-15 digits'
            });
            return;
        }
        const recentOTP = await prisma.oTP.findFirst({
            where: {
                phoneNumber,
                createdAt: {
                    gt: new Date(Date.now() - 60 * 1000)
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        if (recentOTP) {
            const timeLeft = Math.ceil((recentOTP.createdAt.getTime() + 60000 - Date.now()) / 1000);
            res.status(429).json({
                success: false,
                error: `Please wait ${timeLeft} seconds before requesting a new OTP`
            });
            return;
        }
        twilioService_1.twilioService.sendVerificationToken(phoneNumber);
        await prisma.oTP.create({
            data: {
                phoneNumber,
                code: 'twilio-verification',
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                user: {
                    connectOrCreate: {
                        where: { phoneNumber },
                        create: {
                            phoneNumber,
                            firstName: '',
                            lastName: '',
                            role: 'USER',
                        },
                    },
                },
            },
        });
        res.status(200).json({
            success: true,
            data: { phoneNumber },
            message: 'Verification code request initiated'
        });
    }
    catch (error) {
        console.error('Generate OTP error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to initiate verification code'
        });
    }
};
exports.generateOTP = generateOTP;
const verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, code } = req.body;
        const isValid = await twilioService_1.twilioService.verifyToken(phoneNumber, code);
        if (!isValid) {
            res.status(400).json({
                success: false,
                error: 'Invalid or expired verification code'
            });
            return;
        }
        const user = await prisma.user.upsert({
            where: { phoneNumber },
            update: { isVerified: true },
            create: {
                phoneNumber,
                firstName: '',
                lastName: '',
                isVerified: true,
                role: 'USER',
            },
        });
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            role: user.role
        });
        await prisma.oTP.updateMany({
            where: { phoneNumber },
            data: { isUsed: true }
        });
        const safeUser = {
            id: user.id,
            phoneNumber: user.phoneNumber,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isVerified: user.isVerified,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        res.status(200).json({
            success: true,
            data: { token, user: safeUser },
            message: 'OTP verified successfully'
        });
    }
    catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify OTP'
        });
    }
};
exports.verifyOTP = verifyOTP;
//# sourceMappingURL=authController.js.map