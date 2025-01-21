"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app_1 = __importDefault(require("../../app"));
const setup_1 = require("../setup");
const jwt_1 = require("../../utils/jwt");
describe('Wallet Controller', () => {
    let authToken;
    let walletId;
    let userId;
    let testUser;
    beforeEach(async () => {
        await setup_1.prisma.transaction.deleteMany();
        await setup_1.prisma.transfer.deleteMany();
        await setup_1.prisma.wallet.deleteMany();
        await setup_1.prisma.oTP.deleteMany();
        await setup_1.prisma.user.deleteMany();
        const phoneNumber = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
        testUser = await setup_1.prisma.user.create({
            data: {
                phoneNumber,
                firstName: 'Test',
                lastName: 'User',
                isVerified: true,
                role: 'USER',
            },
        });
        userId = testUser.id;
        const tokenPayload = { userId: testUser.id, role: 'USER' };
        authToken = (0, jwt_1.generateToken)(tokenPayload);
        const decoded = (0, jwt_1.verifyToken)(authToken);
        if (!decoded || decoded.userId !== testUser.id) {
            throw new Error('Token verification failed');
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    });
    afterEach(async () => {
        await setup_1.prisma.transaction.deleteMany();
        await setup_1.prisma.transfer.deleteMany();
        await setup_1.prisma.wallet.deleteMany();
        await setup_1.prisma.oTP.deleteMany();
        await setup_1.prisma.user.deleteMany();
    });
    describe('POST /api/wallets', () => {
        it('should create a new wallet', async () => {
            const user = await setup_1.prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new Error('Test user not found');
            }
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/wallets')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                pin: '123456',
                currency: 'USD',
                dailyLimit: 1000,
                monthlyLimit: 5000,
            });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data).toHaveProperty('balance', 0);
            expect(res.body.data).toHaveProperty('currency', 'USD');
            expect(res.body.data).toHaveProperty('dailyLimit', 1000);
            expect(res.body.data).toHaveProperty('monthlyLimit', 5000);
            walletId = res.body.data.id;
        });
        it('should fail with invalid PIN', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/wallets')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                pin: '12',
                currency: 'USD',
            });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('PIN must be 4-6 digits');
        });
    });
    describe('GET /api/wallets/:walletId', () => {
        beforeEach(async () => {
            const wallet = await setup_1.prisma.wallet.create({
                data: {
                    userId,
                    pin: await bcryptjs_1.default.hash('123456', 10),
                    currency: 'USD',
                    dailyLimit: 1000,
                    monthlyLimit: 5000,
                },
            });
            walletId = wallet.id;
        });
        it('should get wallet details', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get(`/api/wallets/${walletId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('totalBalance', 0);
            expect(res.body.data).toHaveProperty('dailySpent', 0);
            expect(res.body.data).toHaveProperty('monthlySpent', 0);
        });
        it('should fail with invalid wallet ID', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/wallets/invalid-id')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });
    describe('POST /api/wallets/:walletId/add', () => {
        beforeEach(async () => {
            const wallet = await setup_1.prisma.wallet.create({
                data: {
                    userId,
                    pin: await bcryptjs_1.default.hash('123456', 10),
                    currency: 'USD',
                    dailyLimit: 1000,
                    monthlyLimit: 5000,
                },
            });
            walletId = wallet.id;
        });
        it('should add money to wallet', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/wallets/${walletId}/add`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                amount: 100,
                type: 'CREDIT',
                description: 'Add money test',
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('balance', 100);
        });
        it('should fail with invalid amount', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/wallets/${walletId}/add`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                amount: -100,
                type: 'CREDIT',
            });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
    describe('POST /api/wallets/:walletId/transfer', () => {
        let receiverWalletId;
        beforeEach(async () => {
            const senderWallet = await setup_1.prisma.wallet.create({
                data: {
                    userId,
                    pin: await bcryptjs_1.default.hash('123456', 10),
                    currency: 'USD',
                    dailyLimit: 1000,
                    monthlyLimit: 5000,
                    balance: 500,
                },
            });
            walletId = senderWallet.id;
            const receiver = await setup_1.prisma.user.create({
                data: {
                    phoneNumber: `+1${Math.floor(Math.random() * 1000000000)}`,
                    firstName: 'Receiver',
                    lastName: 'User',
                    isVerified: true,
                    role: 'USER',
                },
            });
            const receiverWallet = await setup_1.prisma.wallet.create({
                data: {
                    userId: receiver.id,
                    pin: await bcryptjs_1.default.hash('123456', 10),
                    currency: 'USD',
                    dailyLimit: 1000,
                    monthlyLimit: 5000,
                },
            });
            receiverWalletId = receiverWallet.id;
        });
        it('should transfer money between wallets', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/wallets/${walletId}/transfer`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                amount: 50,
                receiverWalletId,
                pin: '123456',
                description: 'Transfer test',
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Transfer completed successfully');
            const senderWallet = await setup_1.prisma.wallet.findUnique({
                where: { id: walletId },
            });
            expect(senderWallet === null || senderWallet === void 0 ? void 0 : senderWallet.balance).toBe(450);
            const receiverWallet = await setup_1.prisma.wallet.findUnique({
                where: { id: receiverWalletId },
            });
            expect(receiverWallet === null || receiverWallet === void 0 ? void 0 : receiverWallet.balance).toBe(50);
        });
        it('should fail with insufficient balance', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/wallets/${walletId}/transfer`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                amount: 1000,
                receiverWalletId,
                pin: '123456',
            });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Insufficient balance');
        });
        it('should fail with invalid PIN', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post(`/api/wallets/${walletId}/transfer`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                amount: 10,
                receiverWalletId,
                pin: '000000',
            });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('Invalid PIN');
        });
    });
    describe('PUT /api/wallets/:walletId/limits', () => {
        beforeEach(async () => {
            const wallet = await setup_1.prisma.wallet.create({
                data: {
                    userId,
                    pin: await bcryptjs_1.default.hash('123456', 10),
                    currency: 'USD',
                    dailyLimit: 1000,
                    monthlyLimit: 5000,
                },
            });
            walletId = wallet.id;
        });
        it('should update wallet limits', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/wallets/${walletId}/limits`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                dailyLimit: 2000,
                monthlyLimit: 10000,
                pin: '123456',
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('dailyLimit', 2000);
            expect(res.body.data).toHaveProperty('monthlyLimit', 10000);
        });
        it('should fail with invalid PIN', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/wallets/${walletId}/limits`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                dailyLimit: 2000,
                monthlyLimit: 10000,
                pin: '000000',
            });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('Invalid PIN');
        });
    });
});
//# sourceMappingURL=wallet.test.js.map