import { Request, Response } from 'express';
import { PrismaClient, Prisma, User } from '@prisma/client';

const prisma = new PrismaClient();

// Validation functions
const validatePhoneNumber = (phoneNumber: string): boolean => {
  return /^\+?[1-9]\d{1,14}$/.test(phoneNumber);
};

const validateOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

type SafeUser = {
  id: string;
  phoneNumber: string;
  isVerified: boolean;
};

const sanitizeUser = (user: User): SafeUser => ({
  id: user.id,
  phoneNumber: user.phoneNumber,
  isVerified: user.isVerified
});

export const generateOTP = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Find or create user
    const user = await prisma.user.upsert({
      where: { phoneNumber },
      update: {},
      create: {
        phoneNumber
      }
    });

    // Create OTP record
    await prisma.otp.create({
      data: {
        code: otp,
        phoneNumber,
        userId: user.id,
        expiresAt
      }
    });

    // In production, you would send this OTP via SMS
    // For development, we'll return it in response
    res.json({ 
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined 
    });
  } catch (error) {
    console.error('Generate OTP Error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).json({ error: 'Database operation failed' });
    } else {
      res.status(400).json({ error: 'Failed to generate OTP' });
    }
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    if (!otp || !validateOTP(otp)) {
      return res.status(400).json({ error: 'Invalid OTP format' });
    }

    // Find the latest unused OTP for this phone number
    const otpRecord = await prisma.otp.findFirst({
      where: {
        phoneNumber,
        code: otp,
        isUsed: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true }
    });

    // Update user verification status and return user data
    const updatedUser = await prisma.user.update({
      where: { phoneNumber },
      data: {
        isVerified: true,
        lastLoginAt: new Date(),
        otpValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    res.json({ 
      message: 'OTP verified successfully',
      user: sanitizeUser(updatedUser)
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).json({ error: 'Database operation failed' });
    } else {
      res.status(400).json({ error: 'Failed to verify OTP' });
    }
  }
}; 