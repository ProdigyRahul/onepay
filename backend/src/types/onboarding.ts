export enum IncomeRange {
  RANGE_0_12500 = '0-12500',
  RANGE_12500_25000 = '12500-25000',
  RANGE_25000_50000 = '25000-50000',
  RANGE_50000_150000 = '50000-150000',
  RANGE_150000_300000 = '150000-300000',
  RANGE_300000_2500000 = '300000-2500000',
  RANGE_2500000_PLUS = '2500000+'
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