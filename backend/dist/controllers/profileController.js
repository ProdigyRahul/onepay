"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileController = void 0;
const walletService_1 = require("../services/walletService");
const userService_1 = require("../services/userService");
const apiError_1 = require("../utils/apiError");
exports.profileController = {
    getProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const walletStats = await walletService_1.WalletService.getWalletStats(userId);
            res.status(200).json({
                success: true,
                data: walletStats,
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
                    error: 'Error fetching profile',
                });
            }
        }
    },
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const { email } = req.body;
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                throw new apiError_1.ApiError(400, 'Invalid email format');
            }
            const updatedUser = await userService_1.UserService.updateUser(userId, { email });
            res.status(200).json({
                success: true,
                data: {
                    email: updatedUser.email,
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
                    error: 'Error updating profile',
                });
            }
        }
    },
};
//# sourceMappingURL=profileController.js.map