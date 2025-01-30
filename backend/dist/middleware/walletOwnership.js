"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWalletOwnership = void 0;
const prisma_1 = require("../lib/prisma");
const apiError_1 = require("../utils/apiError");
const verifyWalletOwnership = async (req, _res, next) => {
    try {
        const walletId = req.params.walletId;
        const userId = req.user.id;
        const wallet = await prisma_1.prisma.wallet.findUnique({
            where: { id: walletId },
        });
        if (!wallet) {
            throw new apiError_1.ApiError(404, 'Wallet not found');
        }
        if (wallet.userId !== userId) {
            throw new apiError_1.ApiError(403, 'You do not have permission to access this wallet');
        }
        if (!wallet.isActive) {
            throw new apiError_1.ApiError(400, 'This wallet is inactive');
        }
        req.wallet = wallet;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.verifyWalletOwnership = verifyWalletOwnership;
//# sourceMappingURL=walletOwnership.js.map