import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import { OTPData, ApiResponse, SafeUser } from '../types';

const prisma = new PrismaClient();

export const generateOTP = async (
  req: Request<{}, {}, { phoneNumber: string }>,
  res: Response<ApiResponse<{ phoneNumber: string }>>
): Promise<void> => {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number format (must start with + and contain only digits)
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      res.status(400).json({ 
        success: false, 
        error: 'Invalid phone number format. Must start with + and contain 10-15 digits' 
      });
      return;
    }

    // Check if an OTP was generated in the last 60 seconds
    const recentOTP = await prisma.oTP.findFirst({
      where: {
        phoneNumber,
        createdAt: {
          gt: new Date(Date.now() - 60 * 1000) // Last 60 seconds
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (recentOTP) {
      const timeLeft = Math.ceil((recentOTP.createdAt.getTime() + 60000 - Date.now()) / 1000);
      res.status(429).json({
        success: false,
        error: `Please wait ${timeLeft} seconds before requesting a new OTP`
      });
      return;
    }

    // Generate a 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Development only: Log OTP to console
    if (process.env.NODE_ENV === 'development') {
      console.log('\x1b[33m%s\x1b[0m', '🔐 Development OTP:', code, 'for', phoneNumber);
    }

    // Find or create user
    const user = await prisma.user.upsert({
      where: { phoneNumber },
      update: {},
      create: {
        phoneNumber,
        firstName: '',
        lastName: '',
      },
    });

    // Create OTP record
    await prisma.oTP.create({
      data: {
        code,
        phoneNumber,
        userId: user.id,
        expiresAt,
      },
    });

    // Only return phoneNumber in response
    res.json({
      success: true,
      data: {
        phoneNumber,
      },
    });
  } catch (error) {
    console.error('Generate OTP Error:', error);
    res.status(500).json({ success: false, error: 'Error generating OTP' });
  }
};

interface VerifyOTPResponse {
  token: string;
  user: SafeUser;
}

export const verifyOTP = async (
  req: Request<{}, {}, OTPData>,
  res: Response<ApiResponse<VerifyOTPResponse>>
): Promise<void> => {
  try {
    const { phoneNumber, code } = req.body;

    // Find the latest unused OTP for the phone number
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        phoneNumber,
        code,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
      return;
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Mark all other unused OTPs for this phone number as used
    await prisma.oTP.updateMany({
      where: {
        phoneNumber,
        isUsed: false,
        id: {
          not: otpRecord.id
        }
      },
      data: {
        isUsed: true
      }
    });

    // Update user verification status
    const user = await prisma.user.update({
      where: { phoneNumber },
      data: {
        isVerified: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, error: 'Error verifying OTP' });
  }
}; 