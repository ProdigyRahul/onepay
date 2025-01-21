import request from 'supertest';
import app from '../../app';
import { prisma } from '../setup';

describe('Auth Controller', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await prisma.oTP.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/generate-otp', () => {
    it('should generate OTP for valid phone number', async () => {
      const res = await request(app)
        .post('/api/auth/generate-otp')
        .send({ phoneNumber: '+1234567890' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('phoneNumber', '+1234567890');
      expect(res.body.data).toHaveProperty('code');
      expect(res.body.data.code).toMatch(/^\d{6}$/);
    });

    it('should fail for invalid phone number', async () => {
      const res = await request(app)
        .post('/api/auth/generate-otp')
        .send({ phoneNumber: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid phone number format');
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    let otpCode: string;
    const phoneNumber = '+1234567890';

    beforeEach(async () => {
      // Clean up database before each test
      await prisma.oTP.deleteMany();
      await prisma.user.deleteMany();

      // Generate OTP first
      const res = await request(app)
        .post('/api/auth/generate-otp')
        .send({ phoneNumber });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('code');
      
      otpCode = res.body.data.code;
    });

    it('should verify valid OTP', async () => {
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phoneNumber, code: otpCode });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('phoneNumber', phoneNumber);
      expect(res.body.data.user).toHaveProperty('isVerified', true);
    });

    it('should fail for invalid OTP', async () => {
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phoneNumber, code: '000000' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid or expired OTP');
    });

    it('should fail for expired OTP', async () => {
      // Update OTP to expired state
      await prisma.oTP.updateMany({
        where: { phoneNumber },
        data: { expiresAt: new Date(Date.now() - 1000 * 60 * 15) }, // 15 minutes ago
      });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phoneNumber, code: otpCode });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid or expired OTP');
    });
  });

  afterAll(async () => {
    await prisma.oTP.deleteMany();
    await prisma.user.deleteMany();
  });
}); 