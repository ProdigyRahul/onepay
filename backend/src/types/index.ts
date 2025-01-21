import { Request } from 'express';
import { Role, KYCStatus } from '@prisma/client';

export type IncomeRange =
  | 'RANGE_0_25000'
  | 'RANGE_25000_100000'
  | 'RANGE_100000_300000'
  | 'RANGE_300000_PLUS';

export type SpendingHabit =
  | 'SPEND_ALL'
  | 'SPEND_NONE'
  | 'SPEND_SOMETIMES'
  | 'SAVE_MOST';

export type UserGoal =
  | 'EVERYDAY_PAYMENTS'
  | 'LOANS'
  | 'INVESTMENTS'
  | 'TRACK_EXPENSES';

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
  kyc?: {
    id: string;
    userId: string;
    panNumber: string;
    dateOfBirth: Date;
    status: KYCStatus;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  financialProfile?: {
    id: string;
    userId: string;
    incomeRange: IncomeRange;
    targetSpendingPercentage: number;
    spendingHabit: SpendingHabit;
    targetSavingsPercentage: number;
    primaryGoal: UserGoal;
    createdAt: Date;
    updatedAt: Date;
  } | null;
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
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface FinancialProfileData {
  incomeRange: IncomeRange;
  targetSpendingPercentage: number;
  spendingHabit: SpendingHabit;
  targetSavingsPercentage: number;
  primaryGoal: UserGoal;
}

export interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  panNumber?: string;
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