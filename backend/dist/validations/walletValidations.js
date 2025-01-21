"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLimitsValidation = exports.transferValidation = exports.addMoneyValidation = exports.createWalletValidation = void 0;
const zod_1 = require("zod");
exports.createWalletValidation = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.enum(['SAVINGS', 'CURRENT', 'BUSINESS'], {
            errorMap: () => ({ message: 'Invalid wallet type' }),
        }),
        currency: zod_1.z.enum(['INR', 'USD'], {
            errorMap: () => ({ message: 'Invalid currency' }),
        }),
    }),
});
exports.addMoneyValidation = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number()
            .min(1, 'Amount must be at least 1')
            .max(1000000, 'Amount must not exceed 1000000'),
        paymentMethod: zod_1.z.enum(['UPI', 'CARD', 'NETBANKING'], {
            errorMap: () => ({ message: 'Invalid payment method' }),
        }),
    }),
});
exports.transferValidation = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number()
            .min(1, 'Amount must be at least 1')
            .max(1000000, 'Amount must not exceed 1000000'),
        toWalletId: zod_1.z.string().uuid('Invalid wallet ID'),
        description: zod_1.z.string().max(100, 'Description must not exceed 100 characters').optional(),
    }),
});
exports.updateLimitsValidation = zod_1.z.object({
    body: zod_1.z.object({
        dailyLimit: zod_1.z.number()
            .min(1000, 'Daily limit must be at least 1000')
            .max(1000000, 'Daily limit must not exceed 1000000')
            .optional(),
        monthlyLimit: zod_1.z.number()
            .min(5000, 'Monthly limit must be at least 5000')
            .max(5000000, 'Monthly limit must not exceed 5000000')
            .optional(),
    }),
});
//# sourceMappingURL=walletValidations.js.map