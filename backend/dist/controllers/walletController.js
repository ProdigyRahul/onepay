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
                    isActive: wallet.isActive,
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
            const stats = await walletService_1.WalletService.getWalletStats(req.params.walletId);
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
    addMoney: async (req, res) => {
        try {
            const walletId = req.params.walletId;
            const transactionData = req.body;
            const wallet = await walletService_1.WalletService.addMoney(walletId, transactionData);
            res.json({
                success: true,
                data: {
                    balance: wallet.balance,
                    currency: wallet.currency,
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
                    error: 'Error adding money to wallet',
                });
            }
        }
    },
    transfer: async (req, res) => {
        try {
            const walletId = req.params.walletId;
            const transferData = req.body;
            await walletService_1.WalletService.transfer(walletId, transferData);
            res.json({
                success: true,
                message: 'Transfer completed successfully',
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
                    error: 'Error processing transfer',
                });
            }
        }
    },
    updateLimits: async (req, res) => {
        try {
            const walletId = req.params.walletId;
            const limitData = req.body;
            const wallet = await walletService_1.WalletService.updateLimits(walletId, limitData);
            res.json({
                success: true,
                data: {
                    dailyLimit: wallet.dailyLimit,
                    monthlyLimit: wallet.monthlyLimit,
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
                    error: 'Error updating wallet limits',
                });
            }
        }
    },
};
//# sourceMappingURL=walletController.js.map