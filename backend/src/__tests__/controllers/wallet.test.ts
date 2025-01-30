import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../app';
import { prisma } from '../setup';
import { generateToken, verifyToken } from '../../utils/jwt';
import { Role } from '@prisma/client';

describe('Wallet Controller', () => {
  let authToken: string;
  let walletId: string;
  let userId: string;
  let testUser: any;

  beforeEach(async () => {
    // Clean up database in correct order to handle foreign key constraints
    await prisma.transaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.oTP.deleteMany();
    await prisma.user.deleteMany();

    // Create test user with unique phone number
    const phoneNumber = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    testUser = await prisma.user.create({
      data: {
        phoneNumber,
        firstName: 'Test',
        lastName: 'User',
        isVerified: true,
        role: Role.USER,
      },
    });
    userId = testUser.id;

    // Generate auth token with proper payload
    const tokenPayload = { userId: testUser.id, role: Role.USER };
    authToken = generateToken(tokenPayload);

    // Verify token is valid
    const decoded = verifyToken(authToken);
    if (!decoded || decoded.userId !== testUser.id) {
      throw new Error('Token verification failed');
    }

    // Wait for database to sync
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    // Clean up in reverse order of dependencies
    await prisma.transaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.oTP.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/wallets', () => {
    it('should create a new wallet', async () => {
      // Verify user exists before making request
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error('Test user not found');
      }

      const res = await request(app)
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
      const res = await request(app)
        .post('/api/wallets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pin: '12', // Too short
          currency: 'USD',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('PIN must be 4-6 digits');
    });
  });

  describe('GET /api/wallets/:walletId', () => {
    beforeEach(async () => {
      // Create a wallet for testing
      const wallet = await prisma.wallet.create({
        data: {
          userId,
          pin: await bcrypt.hash('123456', 10),
          currency: 'USD',
          dailyLimit: 1000,
          monthlyLimit: 5000,
        },
      });
      walletId = wallet.id;
    });

    it('should get wallet details', async () => {
      const res = await request(app)
        .get(`/api/wallets/${walletId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalBalance', 0);
      expect(res.body.data).toHaveProperty('dailySpent', 0);
      expect(res.body.data).toHaveProperty('monthlySpent', 0);
    });

    it('should fail with invalid wallet ID', async () => {
      const res = await request(app)
        .get('/api/wallets/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/wallets/:walletId/add', () => {
    beforeEach(async () => {
      // Create a wallet for testing
      const wallet = await prisma.wallet.create({
        data: {
          userId,
          pin: await bcrypt.hash('123456', 10),
          currency: 'USD',
          dailyLimit: 1000,
          monthlyLimit: 5000,
        },
      });
      walletId = wallet.id;
    });

    it('should add money to wallet', async () => {
      const res = await request(app)
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
      const res = await request(app)
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

  describe('PUT /api/wallets/:walletId/limits', () => {
    beforeEach(async () => {
      // Create a wallet for testing
      const wallet = await prisma.wallet.create({
        data: {
          userId,
          pin: await bcrypt.hash('123456', 10),
          currency: 'USD',
          dailyLimit: 1000,
          monthlyLimit: 5000,
        },
      });
      walletId = wallet.id;
    });

    it('should update wallet limits', async () => {
      const res = await request(app)
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
      const res = await request(app)
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