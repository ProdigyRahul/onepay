"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financialProfileValidation = exports.spendingHabitsValidation = exports.incomeRangeValidation = exports.primaryGoalValidation = exports.ageValidation = exports.profileValidation = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.profileValidation = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        email: zod_1.z.string().email('Invalid email format'),
        panNumber: zod_1.z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format'),
    }),
});
exports.ageValidation = zod_1.z.object({
    body: zod_1.z.object({
        age: zod_1.z.number().min(18, 'Must be at least 18 years old').max(100, 'Invalid age'),
    }),
});
exports.primaryGoalValidation = zod_1.z.object({
    body: zod_1.z.object({
        primaryGoal: zod_1.z.nativeEnum(client_1.UserGoal, {
            errorMap: () => ({ message: 'Invalid primary goal' }),
        }),
    }),
});
exports.incomeRangeValidation = zod_1.z.object({
    body: zod_1.z.object({
        incomeRange: zod_1.z.nativeEnum(client_1.IncomeRange, {
            errorMap: () => ({ message: 'Invalid income range' }),
        }),
    }),
});
exports.spendingHabitsValidation = zod_1.z.object({
    body: zod_1.z.object({
        spendingHabit: zod_1.z.nativeEnum(client_1.SpendingHabit, {
            errorMap: () => ({ message: 'Invalid spending habit' }),
        }),
        targetSpendingPercentage: zod_1.z.number()
            .min(0, 'Spending percentage must be at least 0')
            .max(100, 'Spending percentage must not exceed 100'),
    }),
});
exports.financialProfileValidation = zod_1.z.object({
    body: zod_1.z.object({
        incomeRange: zod_1.z.nativeEnum(client_1.IncomeRange, {
            errorMap: () => ({ message: 'Invalid income range' }),
        }),
        targetSpendingPercentage: zod_1.z.number()
            .min(0, 'Spending percentage must be at least 0')
            .max(100, 'Spending percentage must not exceed 100'),
        spendingHabit: zod_1.z.nativeEnum(client_1.SpendingHabit, {
            errorMap: () => ({ message: 'Invalid spending habit' }),
        }),
        targetSavingsPercentage: zod_1.z.number()
            .min(0, 'Savings percentage must be at least 0')
            .max(100, 'Savings percentage must not exceed 100'),
        primaryGoal: zod_1.z.nativeEnum(client_1.UserGoal, {
            errorMap: () => ({ message: 'Invalid primary goal' }),
        }),
    }),
});
//# sourceMappingURL=onboardingValidations.js.map