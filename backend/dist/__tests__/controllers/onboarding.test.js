"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const app_2 = require("../../app");
const jwt_1 = require("../../utils/jwt");
describe('Onboarding Controller', () => {
    let authToken;
    let userId;
    beforeEach(async () => {
        await app_2.prisma.financialProfile.deleteMany();
        await app_2.prisma.wallet.deleteMany();
        await app_2.prisma.kYC.deleteMany();
        await app_2.prisma.oTP.deleteMany();
        await app_2.prisma.user.deleteMany();
        const user = await app_2.prisma.user.create({
            data: {
                phoneNumber: `+1${Math.floor(Math.random() * 1000000000)}`,
                firstName: '',
                lastName: '',
                email: null,
                role: 'USER',
            },
        });
        userId = user.id;
        authToken = (0, jwt_1.generateToken)({ userId: user.id, role: user.role });
        await new Promise((resolve) => setTimeout(resolve, 500));
        const verifyResponse = await (0, supertest_1.default)(app_1.default)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${authToken}`);
        if (verifyResponse.status !== 200) {
            throw new Error('Token verification failed');
        }
    });
    afterAll(async () => {
        await app_2.prisma.financialProfile.deleteMany();
        await app_2.prisma.wallet.deleteMany();
        await app_2.prisma.kYC.deleteMany();
        await app_2.prisma.oTP.deleteMany();
        await app_2.prisma.user.deleteMany();
        await app_2.prisma.$disconnect();
    });
    describe('POST /api/onboarding/profile', () => {
        it('should update user profile successfully', async () => {
            var _a;
            const profileData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                panNumber: 'ABCDE1234F',
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/onboarding/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(profileData);
            const updatedUser = await app_2.prisma.user.findUnique({
                where: { id: userId },
                include: { kyc: true }
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
                panNumber: profileData.panNumber,
            });
            expect((_a = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.kyc) === null || _a === void 0 ? void 0 : _a.panNumber).toBe(profileData.panNumber);
        });
        it('should reject invalid profile data', async () => {
            const invalidData = {
                firstName: 'J',
                lastName: 'D',
                email: 'invalid-email',
                panNumber: '123',
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/onboarding/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });
    });
    describe('POST /api/onboarding/age', () => {
        it('should update age successfully', async () => {
            const ageData = {
                dateOfBirth: '1990-01-01',
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/onboarding/age')
                .set('Authorization', `Bearer ${authToken}`)
                .send(ageData);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.dateOfBirth).toBeDefined();
        });
        it('should reject invalid age', async () => {
            const invalidData = {
                dateOfBirth: '2020-01-01',
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/onboarding/age')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });
    });
    describe('POST /api/onboarding/financial-profile', () => {
        it('should update financial profile successfully', async () => {
            const financialData = {
                incomeRange: 'RANGE_25000_50000',
                targetSpendingPercentage: 60,
                spendingHabit: 'SPEND_SOMETIMES',
                targetSavingsPercentage: 40,
                primaryGoal: 'INVESTMENTS',
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/onboarding/financial-profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(financialData);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                incomeRange: financialData.incomeRange,
                targetSpendingPercentage: financialData.targetSpendingPercentage,
                spendingHabit: financialData.spendingHabit,
                targetSavingsPercentage: financialData.targetSavingsPercentage,
                primaryGoal: financialData.primaryGoal,
            });
        });
        it('should reject invalid financial profile data', async () => {
            const invalidData = {
                incomeRange: 'INVALID_RANGE',
                targetSpendingPercentage: 150,
                spendingHabit: 'INVALID_HABIT',
                targetSavingsPercentage: -10,
                primaryGoal: 'INVALID_GOAL',
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/onboarding/financial-profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });
    });
    describe('GET /api/onboarding/status', () => {
        it('should return incomplete status for new user', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/onboarding/status')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual({
                profileCompleted: false,
                ageVerified: false,
                financialProfileCompleted: false,
                onboardingComplete: false,
            });
        });
        it('should return complete status after all steps', async () => {
            await (0, supertest_1.default)(app_1.default)
                .post('/api/onboarding/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                panNumber: 'ABCDE1234F',
            });
            await (0, supertest_1.default)(app_1.default)
                .post('/api/onboarding/age')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                dateOfBirth: '1990-01-01',
            });
            await (0, supertest_1.default)(app_1.default)
                .post('/api/onboarding/financial-profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                incomeRange: 'RANGE_25000_50000',
                targetSpendingPercentage: 60,
                spendingHabit: 'SPEND_SOMETIMES',
                targetSavingsPercentage: 40,
                primaryGoal: 'INVESTMENTS',
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/onboarding/status')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual({
                profileCompleted: true,
                ageVerified: true,
                financialProfileCompleted: true,
                onboardingComplete: true,
            });
        });
    });
});
//# sourceMappingURL=onboarding.test.js.map