import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt';
import { OTPData, ApiResponse, SafeUser } from '../types';
import { twilioService } from '../services/twilioService';
import { prisma } from '../lib/prisma';

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

    // Send verification code via Twilio
    twilioService.sendVerificationToken(phoneNumber);

    // Store verification attempt in database
    await prisma.oTP.create({
      data: {
        phoneNumber,
        code: 'twilio-verification', // We don't store the actual code anymore
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        user: {
          connectOrCreate: {
            where: { phoneNumber },
            create: {
              phoneNumber,
              firstName: '',
              lastName: '',
              role: 'USER',
            },
          },
        },
      },
    });

    // Return response immediately without waiting for SMS confirmation
    res.status(200).json({
      success: true,
      data: { phoneNumber },
      message: 'Verification code request initiated'
    });
  } catch (error) {
    console.error('Generate OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate verification code'
    });
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

    // Verify the code with Twilio
    const isValid = await twilioService.verifyToken(phoneNumber, code);

    if (!isValid) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code'
      });
      return;
    }

    // Get or create user
    const user = await prisma.user.upsert({
      where: { phoneNumber },
      update: { isVerified: true },
      create: {
        phoneNumber,
        firstName: '',
        lastName: '',
        isVerified: true,
        role: 'USER',
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      role: user.role
    });

    // Mark all OTPs for this phone number as used
    await prisma.oTP.updateMany({
      where: { phoneNumber },
      data: { isUsed: true }
    });

    // Return safe user object (excluding sensitive data)
    const safeUser: SafeUser = {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      data: { token, user: safeUser },
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP'
    });
  }
};