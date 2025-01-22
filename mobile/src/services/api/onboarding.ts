import { apiClient } from '../../api/client';

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

export interface FinancialProfileData {
  incomeRange: IncomeRange;
  targetSpendingPercentage: number;
  spendingHabit: SpendingHabit;
  targetSavingsPercentage: number;
  primaryGoal: UserGoal;
}

export const onboardingApi = {
  updateProfile: async (data: { firstName: string; lastName: string; email: string; panNumber: string }) => {
    const response = await apiClient.post('/onboarding/profile', data);
    return response.data;
  },

  updateAge: async (age: number) => {
    const response = await apiClient.post('/onboarding/age', { age });
    return response.data;
  },

  updatePrimaryGoal: async (primaryGoal: UserGoal) => {
    const response = await apiClient.post('/onboarding/primary-goal', { primaryGoal });
    return response.data;
  },

  updateIncomeRange: async (incomeRange: IncomeRange) => {
    const response = await apiClient.post('/onboarding/income-range', { incomeRange });
    return response.data;
  },

  updateSpendingHabits: async (data: { spendingHabit: SpendingHabit; targetSpendingPercentage: number }) => {
    const response = await apiClient.post('/onboarding/spending-habits', data);
    return response.data;
  },

  // Legacy method - will be deprecated
  updateFinancialProfile: async (data: FinancialProfileData) => {
    const response = await apiClient.post('/onboarding/financial-profile', data);
    return response.data;
  },

  getOnboardingStatus: async () => {
    const response = await apiClient.get('/onboarding/status');
    return response.data;
  },

  updateKYC: async (kycData: FormData) => {
    const response = await apiClient.post('/users/kyc', kycData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getKYCStatus: async () => {
    const response = await apiClient.get('/users/kyc');
    return response.data;
  },
};
