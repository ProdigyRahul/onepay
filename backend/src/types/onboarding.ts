export enum IncomeRange {
  RANGE_0_25000 = 'RANGE_0_25000',
  RANGE_25000_100000 = 'RANGE_25000_100000',
  RANGE_100000_300000 = 'RANGE_100000_300000',
  RANGE_300000_PLUS = 'RANGE_300000_PLUS'
}

export enum SpendingHabit {
  SPEND_ALL = 'SPEND_ALL',
  SPEND_NONE = 'SPEND_NONE',
  SPEND_SOMETIMES = 'SPEND_SOMETIMES',
  SAVE_MOST = 'SAVE_MOST'
}

export enum UserGoal {
  EVERYDAY_PAYMENTS = 'EVERYDAY_PAYMENTS',
  LOANS = 'LOANS',
  INVESTMENTS = 'INVESTMENTS',
  TRACK_EXPENSES = 'TRACK_EXPENSES'
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  panNumber: string;
}

export interface AgeData {
  dateOfBirth: string; // ISO8601 format
}

export interface FinancialProfileData {
  incomeRange: IncomeRange;
  targetSpendingPercentage: number; // 0-100
  spendingHabit: SpendingHabit;
  targetSavingsPercentage: number; // 0-100
  primaryGoal: UserGoal;
}

export interface OnboardingResponse {
  success: boolean;
  data?: any;
  error?: string;
} 