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
    try {
      const response = await apiClient.post('/onboarding/profile', data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update profile');
    }
  },

  updateAge: async (age: number) => {
    try {
      const response = await apiClient.post('/onboarding/age', { age });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update age');
    }
  },

  updatePrimaryGoal: async (primaryGoal: UserGoal) => {
    try {
      const response = await apiClient.post('/onboarding/primary-goal', { primaryGoal });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update primary goal');
    }
  },

  updateIncomeRange: async (incomeRange: IncomeRange) => {
    try {
      const response = await apiClient.post('/onboarding/income-range', { incomeRange });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update income range');
    }
  },

  updateSpendingHabits: async (data: { spendingHabit: SpendingHabit; targetSpendingPercentage: number }) => {
    try {
      const response = await apiClient.post('/onboarding/spending-habits', data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update spending habits');
    }
  },

  // Legacy method - will be deprecated
  updateFinancialProfile: async (data: FinancialProfileData) => {
    try {
      const response = await apiClient.post('/onboarding/financial-profile', data);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update financial profile');
    }
  },

  getOnboardingStatus: async () => {
    try {
      const response = await apiClient.get('/onboarding/status');
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get onboarding status');
    }
  },

  updateKYC: async (kycData: FormData) => {
    try {
      const response = await apiClient.post('/users/kyc', kycData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update KYC');
    }
  },

  getKYCStatus: async () => {
    try {
      const response = await apiClient.get('/users/kyc');
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get KYC status');
    }
  },
};
