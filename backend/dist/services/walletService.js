"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const apiError_1 = require("../utils/apiError");
const prisma = new client_1.PrismaClient();
class WalletService {
    static async createWallet(userId, data) {
        const hashedPin = await bcryptjs_1.default.hash(data.pin, 10);
        return prisma.wallet.create({
            data: {
                userId,
                pin: hashedPin,
                currency: data.currency,
                dailyLimit: data.dailyLimit,
                monthlyLimit: data.monthlyLimit,
            },
        });
    }
    static async verifyPin(walletId, pin) {
        const wallet = await prisma.wallet.findUnique({
            where: { id: walletId },
        });
        if (!wallet) {
            throw new apiError_1.ApiError(404, 'Wallet not found');
        }
        if (wallet.isBlocked) {
            if (wallet.blockedUntil && wallet.blockedUntil > new Date()) {
                throw new apiError_1.ApiError(403, 'Wallet is blocked. Try again later.');
            }
            await prisma.wallet.update({
                where: { id: walletId },
                data: { isBlocked: false, pinAttempts: 0 },
            });
        }
        const isValid = await bcryptjs_1.default.compare(pin, wallet.pin);
        if (!isValid) {
            const attempts = wallet.pinAttempts + 1;
            if (attempts >= 3) {
                await prisma.wallet.update({
                    where: { id: walletId },
                    data: {
                        isBlocked: true,
                        blockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        pinAttempts: 0,
                    },
                });
                throw new apiError_1.ApiError(403, 'Wallet blocked due to too many invalid PIN attempts');
            }
            await prisma.wallet.update({
                where: { id: walletId },
                data: { pinAttempts: attempts },
            });
            throw new apiError_1.ApiError(401, `Invalid PIN. ${3 - attempts} attempts remaining`);
        }
        if (wallet.pinAttempts > 0) {
            await prisma.wallet.update({
                where: { id: walletId },
                data: { pinAttempts: 0 },
            });
        }
        return true;
    }
    static async getWalletStats(walletId) {
        const wallet = await prisma.wallet.findUnique({
            where: { id: walletId },
        });
        if (!wallet) {
            throw new apiError_1.ApiError(404, 'Wallet not found');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const [dailySpent, monthlySpent] = await Promise.all([
            prisma.transaction.aggregate({
                where: {
                    walletId,
                    type: client_1.TransactionType.DEBIT,
                    createdAt: { gte: today },
                },
                _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
                where: {
                    walletId,
                    type: client_1.TransactionType.DEBIT,
                    createdAt: { gte: firstDayOfMonth },
                },
                _sum: { amount: true },
            }),
        ]);
        return {
            dailySpent: dailySpent._sum.amount || 0,
            monthlySpent: monthlySpent._sum.amount || 0,
            remainingDailyLimit: wallet.dailyLimit - (dailySpent._sum.amount || 0),
            remainingMonthlyLimit: wallet.monthlyLimit - (monthlySpent._sum.amount || 0),
            totalBalance: wallet.balance,
        };
    }
    static async addMoney(walletId, data) {
        return prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({
                where: { id: walletId },
            });
            if (!wallet) {
                throw new apiError_1.ApiError(404, 'Wallet not found');
            }
            if (!wallet.isActive) {
                throw new apiError_1.ApiError(403, 'Wallet is inactive');
            }
            const newBalance = wallet.balance + data.amount;
            await tx.transaction.create({
                data: {
                    walletId,
                    type: client_1.TransactionType.CREDIT,
                    amount: data.amount,
                    balance: newBalance,
                    description: data.description,
                    metadata: data.metadata,
                    status: 'COMPLETED',
                },
            });
            return tx.wallet.update({
                where: { id: walletId },
                data: { balance: newBalance },
            });
        });
    }
    static async transfer(senderWalletId, data) {
        await prisma.$transaction(async (tx) => {
            const senderWallet = await tx.wallet.findUnique({
                where: { id: senderWalletId },
            });
            if (!senderWallet) {
                throw new apiError_1.ApiError(404, 'Sender wallet not found');
            }
            await this.verifyPin(senderWalletId, data.pin);
            const receiverWallet = await tx.wallet.findUnique({
                where: { id: data.receiverWalletId },
            });
            if (!receiverWallet) {
                throw new apiError_1.ApiError(404, 'Receiver wallet not found');
            }
            if (senderWallet.balance < data.amount) {
                throw new apiError_1.ApiError(400, 'Insufficient balance');
            }
            const stats = await this.getWalletStats(senderWalletId);
            if (stats.remainingDailyLimit < data.amount) {
                throw new apiError_1.ApiError(400, 'Daily transfer limit exceeded');
            }
            if (stats.remainingMonthlyLimit < data.amount) {
                throw new apiError_1.ApiError(400, 'Monthly transfer limit exceeded');
            }
            const transfer = await tx.transfer.create({
                data: {
                    amount: data.amount,
                    senderWalletId,
                    receiverWalletId: receiverWallet.id,
                    description: data.description,
                    status: 'COMPLETED',
                },
            });
            await tx.wallet.update({
                where: { id: senderWalletId },
                data: { balance: senderWallet.balance - data.amount },
            });
            await tx.transaction.create({
                data: {
                    walletId: senderWalletId,
                    type: client_1.TransactionType.DEBIT,
                    amount: data.amount,
                    balance: senderWallet.balance - data.amount,
                    description: `Transfer to ${receiverWallet.id}`,
                    status: 'COMPLETED',
                    metadata: { transferId: transfer.id },
                },
            });
            await tx.wallet.update({
                where: { id: receiverWallet.id },
                data: { balance: receiverWallet.balance + data.amount },
            });
            await tx.transaction.create({
                data: {
                    walletId: receiverWallet.id,
                    type: client_1.TransactionType.CREDIT,
                    amount: data.amount,
                    balance: receiverWallet.balance + data.amount,
                    description: `Transfer from ${senderWalletId}`,
                    status: 'COMPLETED',
                    metadata: { transferId: transfer.id },
                },
            });
        });
    }
    static async updateLimits(walletId, data) {
        await this.verifyPin(walletId, data.pin);
        return prisma.wallet.update({
            where: { id: walletId },
            data: {
                dailyLimit: data.dailyLimit,
                monthlyLimit: data.monthlyLimit,
            },
        });
    }
}
exports.WalletService = WalletService;
//# sourceMappingURL=walletService.js.map