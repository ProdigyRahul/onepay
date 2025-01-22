"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingController = void 0;
const client_1 = require("@prisma/client");
const apiError_1 = require("../utils/apiError");
const prisma = new client_1.PrismaClient();
exports.onboardingController = {
    updateProfile: async (req, res) => {
        var _a;
        try {
            const userId = req.user.id;
            const profileData = req.body;
            const updateData = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
            };
            if (profileData.panNumber) {
                updateData.kyc = {
                    upsert: {
                        create: {
                            panNumber: profileData.panNumber,
                            dateOfBirth: new Date(),
                            status: 'PENDING',
                        },
                        update: {
                            panNumber: profileData.panNumber,
                            status: 'PENDING',
                        },
                    },
                };
            }
            const user = await prisma.user.update({
                where: { id: userId },
                data: updateData,
                include: {
                    kyc: true,
                },
            });
            res.json({
                success: true,
                data: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    panNumber: (_a = user.kyc) === null || _a === void 0 ? void 0 : _a.panNumber,
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
                console.error('Profile Update Error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Error updating profile',
                });
            }
        }
    },
    updateAge: async (req, res) => {
        try {
            const userId = req.user.id;
            const { age } = req.body;
            const today = new Date();
            const birthYear = today.getFullYear() - age;
            const dateOfBirth = new Date(birthYear, today.getMonth(), today.getDate());
            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    kyc: {
                        update: {
                            dateOfBirth,
                        },
                    },
                },
                include: {
                    kyc: true,
                },
            });
            if (!user.kyc) {
                throw new apiError_1.ApiError(400, 'Please complete profile with PAN number first');
            }
            res.json({
                success: true,
                data: {
                    age,
                    dateOfBirth: user.kyc.dateOfBirth,
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
                console.error('Age Update Error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Error updating age',
                });
            }
        }
    },
    updateFinancialProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const financialData = req.body;
            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    financialProfile: {
                        upsert: {
                            create: {
                                incomeRange: financialData.incomeRange,
                                targetSpendingPercentage: financialData.targetSpendingPercentage,
                                spendingHabit: financialData.spendingHabit,
                                targetSavingsPercentage: financialData.targetSavingsPercentage,
                                primaryGoal: financialData.primaryGoal,
                            },
                            update: {
                                incomeRange: financialData.incomeRange,
                                targetSpendingPercentage: financialData.targetSpendingPercentage,
                                spendingHabit: financialData.spendingHabit,
                                targetSavingsPercentage: financialData.targetSavingsPercentage,
                                primaryGoal: financialData.primaryGoal,
                            },
                        },
                    },
                },
                include: {
                    financialProfile: true,
                },
            });
            res.json({
                success: true,
                data: user.financialProfile,
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
                console.error('Financial Profile Update Error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Error updating financial profile',
                });
            }
        }
    },
    updatePrimaryGoal: async (req, res) => {
        var _a;
        try {
            const userId = req.user.id;
            const { primaryGoal } = req.body;
            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    financialProfile: {
                        upsert: {
                            create: {
                                primaryGoal,
                                incomeRange: client_1.IncomeRange.RANGE_0_25000,
                                targetSpendingPercentage: 0,
                                spendingHabit: client_1.SpendingHabit.SPEND_SOMETIMES,
                                targetSavingsPercentage: 0,
                            },
                            update: {
                                primaryGoal,
                            },
                        },
                    },
                },
                include: {
                    financialProfile: true,
                },
            });
            res.json({
                success: true,
                data: {
                    primaryGoal: (_a = user.financialProfile) === null || _a === void 0 ? void 0 : _a.primaryGoal,
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
                console.error('Primary Goal Update Error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Error updating primary goal',
                });
            }
        }
    },
    updateIncomeRange: async (req, res) => {
        var _a, _b;
        try {
            const userId = req.user.id;
            const { incomeRange } = req.body;
            console.log('Received income range update request:', {
                userId,
                body: req.body,
                incomeRange,
                validRanges: Object.values(client_1.IncomeRange)
            });
            if (!Object.values(client_1.IncomeRange).includes(incomeRange)) {
                console.error('Invalid income range:', {
                    received: incomeRange,
                    validOptions: Object.values(client_1.IncomeRange)
                });
                throw new apiError_1.ApiError(400, `Invalid income range. Must be one of: ${Object.values(client_1.IncomeRange).join(', ')}`);
            }
            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    financialProfile: {
                        upsert: {
                            create: {
                                incomeRange,
                                targetSpendingPercentage: 0,
                                spendingHabit: client_1.SpendingHabit.SPEND_SOMETIMES,
                                targetSavingsPercentage: 0,
                                primaryGoal: client_1.UserGoal.EVERYDAY_PAYMENTS,
                            },
                            update: {
                                incomeRange,
                            },
                        },
                    },
                },
                include: {
                    financialProfile: true,
                },
            });
            console.log('Income range updated successfully:', {
                userId,
                newIncomeRange: (_a = user.financialProfile) === null || _a === void 0 ? void 0 : _a.incomeRange
            });
            res.json({
                success: true,
                data: {
                    incomeRange: (_b = user.financialProfile) === null || _b === void 0 ? void 0 : _b.incomeRange,
                },
            });
        }
        catch (error) {
            console.error('Income range update error:', {
                error,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorStack: error instanceof Error ? error.stack : undefined
            });
            if (error instanceof apiError_1.ApiError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: error.message,
                });
            }
            else {
                console.error('Income Range Update Error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Error updating income range',
                });
            }
        }
    },
    updateSpendingHabits: async (req, res) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        try {
            const userId = req.user.id;
            const { spendingHabit, targetSpendingPercentage } = req.body;
            const user = await prisma.user.update({
                where: { id: userId },
                data: {
                    financialProfile: {
                        upsert: {
                            create: {
                                spendingHabit,
                                targetSpendingPercentage,
                                targetSavingsPercentage: 100 - targetSpendingPercentage,
                                primaryGoal: client_1.UserGoal.EVERYDAY_PAYMENTS,
                                incomeRange: client_1.IncomeRange.RANGE_0_25000,
                            },
                            update: {
                                spendingHabit,
                                targetSpendingPercentage,
                                targetSavingsPercentage: 100 - targetSpendingPercentage,
                            },
                        },
                    },
                },
                include: {
                    financialProfile: true,
                    kyc: true,
                },
            });
            const isOnboardingComplete = !!(user.firstName &&
                user.lastName &&
                user.email &&
                ((_a = user.kyc) === null || _a === void 0 ? void 0 : _a.panNumber) &&
                ((_b = user.kyc) === null || _b === void 0 ? void 0 : _b.dateOfBirth) &&
                ((_c = user.financialProfile) === null || _c === void 0 ? void 0 : _c.primaryGoal) &&
                ((_d = user.financialProfile) === null || _d === void 0 ? void 0 : _d.incomeRange) &&
                ((_e = user.financialProfile) === null || _e === void 0 ? void 0 : _e.spendingHabit) &&
                ((_f = user.kyc) === null || _f === void 0 ? void 0 : _f.status) === 'VERIFIED');
            if (isOnboardingComplete) {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        isVerified: true,
                    },
                });
            }
            res.json({
                success: true,
                data: {
                    spendingHabit: (_g = user.financialProfile) === null || _g === void 0 ? void 0 : _g.spendingHabit,
                    targetSpendingPercentage: (_h = user.financialProfile) === null || _h === void 0 ? void 0 : _h.targetSpendingPercentage,
                    targetSavingsPercentage: (_j = user.financialProfile) === null || _j === void 0 ? void 0 : _j.targetSavingsPercentage,
                    isOnboardingComplete,
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
                console.error('Spending Habits Update Error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Error updating spending habits',
                });
            }
        }
    },
    getStatus: async (req, res) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        try {
            const userId = req.user.id;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    kyc: true,
                    financialProfile: true,
                },
            });
            if (!user) {
                throw new apiError_1.ApiError(404, 'User not found');
            }
            const spendingHabitsSet = !!((_a = user.financialProfile) === null || _a === void 0 ? void 0 : _a.spendingHabit);
            const onboardingComplete = !!(user.firstName &&
                user.lastName &&
                user.email &&
                ((_b = user.kyc) === null || _b === void 0 ? void 0 : _b.panNumber) &&
                ((_c = user.kyc) === null || _c === void 0 ? void 0 : _c.dateOfBirth) &&
                ((_d = user.financialProfile) === null || _d === void 0 ? void 0 : _d.primaryGoal) &&
                ((_e = user.financialProfile) === null || _e === void 0 ? void 0 : _e.incomeRange) &&
                ((_f = user.financialProfile) === null || _f === void 0 ? void 0 : _f.spendingHabit) &&
                ((_g = user.kyc) === null || _g === void 0 ? void 0 : _g.status) === 'VERIFIED');
            const status = {
                profileCompleted: !!(user.firstName && user.lastName && user.email && ((_h = user.kyc) === null || _h === void 0 ? void 0 : _h.panNumber)),
                ageVerified: !!((_j = user.kyc) === null || _j === void 0 ? void 0 : _j.dateOfBirth),
                primaryGoalSet: !!((_k = user.financialProfile) === null || _k === void 0 ? void 0 : _k.primaryGoal),
                incomeRangeSet: !!((_l = user.financialProfile) === null || _l === void 0 ? void 0 : _l.incomeRange),
                spendingHabitsSet,
                onboardingComplete,
                kycStatus: ((_m = user.kyc) === null || _m === void 0 ? void 0 : _m.status) || null,
            };
            res.json({
                success: true,
                data: status,
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
                console.error('Status Check Error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Error checking onboarding status',
                });
            }
        }
    },
};
//# sourceMappingURL=onboardingController.js.map