"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletController = void 0;
const walletService_1 = require("../services/walletService");
const apiError_1 = require("../utils/apiError");
exports.walletController = {
    createWallet: async (req, res) => {
        try {
            const userId = req.user.id;
            const walletData = req.body;
            const wallet = await walletService_1.WalletService.createWallet(userId, walletData);
            res.status(201).json({
                success: true,
                data: {
                    id: wallet.id,
                    balance: wallet.balance,
                    currency: wallet.currency,
                    dailyLimit: wallet.dailyLimit,
                    monthlyLimit: wallet.monthlyLimit,
                    isActive: !wallet.isBlocked,
                },
            });
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Error creating wallet',
                });
            }
        }
    },
    getWallet: async (req, res) => {
        try {
            const stats = await walletService_1.WalletService.getWalletStats(req.user.id);
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Error fetching wallet details',
                });
            }
        }
    },
    getWalletBalance: async (req, res) => {
        try {
            const wallet = await walletService_1.WalletService.getWalletBalance(req.user.id);
            res.json({
                success: true,
                data: wallet,
            });
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Error fetching wallet balance',
                });
            }
        }
    },
    transfer: async (req, res) => {
        try {
            const userId = req.user.id;
            const transferData = req.body;
            const transaction = await walletService_1.WalletService.transfer(userId, transferData.toWalletId, transferData.amount, transferData.description || 'Transfer');
            res.json({
                success: true,
                data: transaction,
            });
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Error transferring money',
                });
            }
        }
    },
    getWalletStats: async (req, res) => {
        try {
            const stats = await walletService_1.WalletService.getWalletStats(req.user.id);
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: 'Error fetching wallet stats',
                });
            }
        }
    },
};
//# sourceMappingURL=walletController.js.map