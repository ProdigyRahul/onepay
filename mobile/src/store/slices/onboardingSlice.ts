import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IncomeRange, SpendingHabit, UserGoal } from '../../services/api/onboarding';

interface OnboardingState {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  panNumber: string | null;
  age: number | null;
  primaryGoal: UserGoal | null;
  incomeRange: IncomeRange | null;
  spendingHabit: SpendingHabit | null;
  targetSpendingPercentage: number | null;
  targetSavingsPercentage: number | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OnboardingState = {
  firstName: null,
  lastName: null,
  email: null,
  panNumber: null,
  age: null,
  primaryGoal: null,
  incomeRange: null,
  spendingHabit: null,
  targetSpendingPercentage: null,
  targetSavingsPercentage: null,
  isLoading: false,
  error: null,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<{ firstName: string; lastName: string; email: string; panNumber: string }>) => {
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.email = action.payload.email;
      state.panNumber = action.payload.panNumber;
    },
    setAge: (state, action: PayloadAction<number>) => {
      state.age = action.payload;
    },
    setPurpose: (state, action: PayloadAction<UserGoal>) => {
      state.primaryGoal = action.payload;
    },
    setIncome: (state, action: PayloadAction<IncomeRange>) => {
      state.incomeRange = action.payload;
    },
    setSpending: (state, action: PayloadAction<{ habit: SpendingHabit; percentage: number }>) => {
      state.spendingHabit = action.payload.habit;
      state.targetSpendingPercentage = action.payload.percentage;
    },
    setSavings: (state, action: PayloadAction<number>) => {
      state.targetSavingsPercentage = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    resetOnboarding: () => initialState,
  },
});

export const {
  setProfile,
  setAge,
  setPurpose,
  setIncome,
  setSpending,
  setSavings,
  setLoading,
  setError,
  resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer; 