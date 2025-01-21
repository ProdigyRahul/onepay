"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.generateOTP = void 0;
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
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
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        if (process.env.NODE_ENV === 'development') {
            console.log('\x1b[33m%s\x1b[0m', '🔐 Development OTP:', code, 'for', phoneNumber);
        }
        const user = await prisma.user.upsert({
            where: { phoneNumber },
            update: {},
            create: {
                phoneNumber,
                firstName: '',
                lastName: '',
            },
        });
        await prisma.oTP.create({
            data: {
                code,
                phoneNumber,
                userId: user.id,
                expiresAt,
            },
        });
        res.json({
            success: true,
            data: {
                phoneNumber,
            },
        });
    }
    catch (error) {
        console.error('Generate OTP Error:', error);
        res.status(500).json({ success: false, error: 'Error generating OTP' });
    }
};
exports.generateOTP = generateOTP;
const verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, code } = req.body;
        const otpRecord = await prisma.oTP.findFirst({
            where: {
                phoneNumber,
                code,
                isUsed: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!otpRecord) {
            res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
            return;
        }
        await prisma.oTP.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
        });
        await prisma.oTP.updateMany({
            where: {
                phoneNumber,
                isUsed: false,
                id: {
                    not: otpRecord.id
                }
            },
            data: {
                isUsed: true
            }
        });
        const user = await prisma.user.update({
            where: { phoneNumber },
            data: {
                isVerified: true,
            },
        });
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            role: user.role,
        });
        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isVerified: user.isVerified,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ success: false, error: 'Error verifying OTP' });
    }
};
exports.verifyOTP = verifyOTP;
//# sourceMappingURL=authController.js.map