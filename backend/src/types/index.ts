import { Request } from 'express';
import { IncomeRange, SpendingType, PurposeType, Role } from '@prisma/client';

// Base user interface matching Prisma schema
export interface User {
  id: string;
  phoneNumber: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Safe user response without sensitive data
export interface SafeUser {
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: Role;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

export interface TokenPayload {
  userId: string;
  role: Role;
}

export interface KYCData {
  panNumber: string;
  dateOfBirth: string;
  incomeRange: IncomeRange;
  spendingType: SpendingType;
  savingGoal: number;
  purposeType: PurposeType;
}

export interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface OTPData {
  phoneNumber: string;
  code: string;
}

// Request body interfaces
export interface CreateUserRequest {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
} 