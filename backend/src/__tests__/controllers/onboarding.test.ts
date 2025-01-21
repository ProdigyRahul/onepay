import request from 'supertest';
import app from '../../app';
import { prisma } from '../../app';
import { generateToken } from '../../utils/jwt';

describe('Onboarding Controller', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Clean up the database in correct order
    await prisma.financialProfile.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.kYC.deleteMany();
    await prisma.oTP.deleteMany();
    await prisma.user.deleteMany();

    // Create a test user
    const user = await prisma.user.create({
      data: {
        phoneNumber: `+1${Math.floor(Math.random() * 1000000000)}`,
        firstName: '',
        lastName: '',
        email: null,
        role: 'USER',
      },
    });

    userId = user.id;
    authToken = generateToken({ userId: user.id, role: user.role });

    // Wait for token to be properly registered
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify token is valid
    const verifyResponse = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`);
    
    if (verifyResponse.status !== 200) {
      throw new Error('Token verification failed');
    }
  });

  afterAll(async () => {
    // Clean up in correct order
    await prisma.financialProfile.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.kYC.deleteMany();
    await prisma.oTP.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/onboarding/profile', () => {
    it('should update user profile successfully', async () => {
      const profileData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        panNumber: 'ABCDE1234F',
      };

      const response = await request(app)
        .post('/api/onboarding/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData);

      // Verify the user was updated correctly
      const updatedUser = await prisma.user.findUnique({
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
      expect(updatedUser?.kyc?.panNumber).toBe(profileData.panNumber);
    });

    it('should reject invalid profile data', async () => {
      const invalidData = {
        firstName: 'J', // Too short
        lastName: 'D',  // Too short
        email: 'invalid-email',
        panNumber: '123', // Invalid format
      };

      const response = await request(app)
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

      const response = await request(app)
        .post('/api/onboarding/age')
        .set('Authorization', `Bearer ${authToken}`)
        .send(ageData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.dateOfBirth).toBeDefined();
    });

    it('should reject invalid age', async () => {
      const invalidData = {
        dateOfBirth: '2020-01-01', // Under 18
      };

      const response = await request(app)
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

      const response = await request(app)
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
        targetSpendingPercentage: 150, // Over 100%
        spendingHabit: 'INVALID_HABIT',
        targetSavingsPercentage: -10, // Negative
        primaryGoal: 'INVALID_GOAL',
      };

      const response = await request(app)
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
      const response = await request(app)
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
      // Complete profile
      await request(app)
        .post('/api/onboarding/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          panNumber: 'ABCDE1234F',
        });

      // Complete age verification
      await request(app)
        .post('/api/onboarding/age')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          dateOfBirth: '1990-01-01',
        });

      // Complete financial profile
      await request(app)
        .post('/api/onboarding/financial-profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          incomeRange: 'RANGE_25000_50000',
          targetSpendingPercentage: 60,
          spendingHabit: 'SPEND_SOMETIMES',
          targetSavingsPercentage: 40,
          primaryGoal: 'INVESTMENTS',
        });

      const response = await request(app)
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