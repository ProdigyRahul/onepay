"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const apiError_1 = require("../utils/apiError");
const wallet_1 = require("../types/wallet");
const prisma_1 = require("../lib/prisma");
const transactionUtils_1 = require("../utils/transactionUtils");
class WalletService {
    static async createWallet(userId, data) {
        const existingWallet = await prisma_1.prisma.wallet.findUnique({
            where: { userId }
        });
        if (existingWallet) {
            throw new apiError_1.ApiError(400, 'User already has a wallet');
        }
        const accountNumber = await (0, transactionUtils_1.generateAccountNumber)();
        const hashedPin = await bcryptjs_1.default.hash(data.pin, 10);
        return await prisma_1.prisma.wallet.create({
            data: {
                userId,
                accountNumber,
                pin: hashedPin,
                currency: data.currency || 'INR',
                type: data.type || wallet_1.WalletType.SAVINGS,
                dailyLimit: data.dailyLimit || 10000,
                monthlyLimit: data.monthlyLimit || 100000
            }
        });
    }
    static async getWalletStats(userId) {
        var _a, _b, _c;
        const wallet = await prisma_1.prisma.wallet.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phoneNumber: true,
                        kyc: {
                            select: {
                                status: true
                            }
                        }
                    }
                },
                transactions: {
                    where: {
                        status: client_1.TransactionStatus.COMPLETED
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 5,
                    select: {
                        id: true,
                        type: true,
                        amount: true,
                        status: true,
                        createdAt: true
                    }
                }
            }
        });
        if (!wallet) {
            throw new apiError_1.ApiError(404, 'Wallet not found');
        }
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthlyTransactions = await prisma_1.prisma.transaction.findMany({
            where: {
                OR: [
                    { senderWalletId: wallet.id },
                    { receiverWalletId: wallet.id }
                ],
                status: client_1.TransactionStatus.COMPLETED,
                createdAt: {
                    gte: startOfMonth
                }
            }
        });
        const monthlyStats = monthlyTransactions.reduce((acc, transaction) => {
            if (transaction.receiverWalletId === wallet.id) {
                acc.income += transaction.amount;
            }
            else {
                acc.expenses += transaction.amount;
            }
            return acc;
        }, { income: 0, expenses: 0 });
        const qrData = {
            walletId: wallet.id,
            userId,
            name: `${wallet.user.firstName} ${wallet.user.lastName}`,
            type: 'ONEPAY_WALLET'
        };
        const recentTransactions = wallet.transactions.map(t => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            status: t.status,
            createdAt: t.createdAt
        }));
        return {
            id: wallet.id,
            balance: wallet.balance,
            currency: wallet.currency,
            type: wallet.type,
            isActive: !wallet.isBlocked,
            blockedUntil: wallet.blockedUntil || undefined,
            dailyLimit: wallet.dailyLimit,
            monthlyLimit: wallet.monthlyLimit,
            monthlyIncome: monthlyStats.income,
            monthlyExpenses: monthlyStats.expenses,
            recentTransactions,
            user: {
                firstName: wallet.user.firstName,
                lastName: wallet.user.lastName,
                email: (_a = wallet.user.email) !== null && _a !== void 0 ? _a : '',
                phoneNumber: wallet.user.phoneNumber,
                kycStatus: (_c = (_b = wallet.user.kyc) === null || _b === void 0 ? void 0 : _b.status) !== null && _c !== void 0 ? _c : client_1.KYCStatus.PENDING
            },
            qrCodeData: Buffer.from(JSON.stringify(qrData)).toString('base64')
        };
    }
    static async getWalletBalance(userId) {
        const wallet = await prisma_1.prisma.wallet.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        if (!wallet) {
            throw new apiError_1.ApiError(404, 'Wallet not found');
        }
        return {
            id: wallet.id,
            balance: wallet.balance,
            currency: wallet.currency,
            dailyLimit: wallet.dailyLimit,
            monthlyLimit: wallet.monthlyLimit,
            isActive: !wallet.isBlocked,
            isBlocked: wallet.isBlocked,
            blockedUntil: wallet.blockedUntil ? new Date(wallet.blockedUntil) : undefined,
            firstName: wallet.user.firstName,
            lastName: wallet.user.lastName
        };
    }
    static async transfer(fromUserId, toWalletId, amount, description) {
        const fromWallet = await prisma_1.prisma.wallet.findUnique({
            where: { userId: fromUserId }
        });
        if (!fromWallet) {
            throw new apiError_1.ApiError(404, 'Sender wallet not found');
        }
        const toWallet = await prisma_1.prisma.wallet.findUnique({
            where: { id: toWalletId }
        });
        if (!toWallet) {
            throw new apiError_1.ApiError(404, 'Receiver wallet not found');
        }
        if (fromWallet.isBlocked) {
            throw new apiError_1.ApiError(403, 'Sender wallet is blocked');
        }
        if (toWallet.isBlocked) {
            throw new apiError_1.ApiError(403, 'Receiver wallet is blocked');
        }
        if (fromWallet.balance < amount) {
            throw new apiError_1.ApiError(400, 'Insufficient balance');
        }
        const transactionId = await (0, transactionUtils_1.generateTransactionId)();
        const transaction = await prisma_1.prisma.$transaction(async (prisma) => {
            await prisma.wallet.update({
                where: { id: fromWallet.id },
                data: { balance: { decrement: amount } }
            });
            await prisma.wallet.update({
                where: { id: toWallet.id },
                data: { balance: { increment: amount } }
            });
            const transaction = await prisma.transaction.create({
                data: {
                    transactionId,
                    type: client_1.TransactionType.DEBIT,
                    amount,
                    description,
                    status: client_1.TransactionStatus.COMPLETED,
                    walletId: fromWallet.id,
                    senderWalletId: fromWallet.id,
                    receiverWalletId: toWallet.id
                }
            });
            return {
                id: transaction.id,
                transactionId: transaction.transactionId,
                type: transaction.type,
                amount: transaction.amount,
                description: transaction.description || undefined,
                status: transaction.status,
                createdAt: transaction.createdAt,
                senderWalletId: transaction.senderWalletId,
                receiverWalletId: transaction.receiverWalletId
            };
        });
        return transaction;
    }
}
exports.WalletService = WalletService;
//# sourceMappingURL=walletService.js.map