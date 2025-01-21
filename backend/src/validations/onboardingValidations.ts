import { z } from 'zod';
import { IncomeRange, SpendingHabit, UserGoal } from '@prisma/client';

export const profileValidation = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email format'),
    panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format'),
  }),
});

export const ageValidation = z.object({
  body: z.object({
    age: z.number().min(18, 'Must be at least 18 years old').max(100, 'Invalid age'),
  }),
});

export const primaryGoalValidation = z.object({
  body: z.object({
    primaryGoal: z.nativeEnum(UserGoal, {
      errorMap: () => ({ message: 'Invalid primary goal' }),
    }),
  }),
});

export const incomeRangeValidation = z.object({
  body: z.object({
    incomeRange: z.nativeEnum(IncomeRange, {
      errorMap: () => ({ message: 'Invalid income range' }),
    }),
  }),
});

export const spendingHabitsValidation = z.object({
  body: z.object({
    spendingHabit: z.nativeEnum(SpendingHabit, {
      errorMap: () => ({ message: 'Invalid spending habit' }),
    }),
    targetSpendingPercentage: z.number()
      .min(0, 'Spending percentage must be at least 0')
      .max(100, 'Spending percentage must not exceed 100'),
  }),
});

export const financialProfileValidation = z.object({
  body: z.object({
    incomeRange: z.nativeEnum(IncomeRange, {
      errorMap: () => ({ message: 'Invalid income range' }),
    }),
    targetSpendingPercentage: z.number()
      .min(0, 'Spending percentage must be at least 0')
      .max(100, 'Spending percentage must not exceed 100'),
    spendingHabit: z.nativeEnum(SpendingHabit, {
      errorMap: () => ({ message: 'Invalid spending habit' }),
    }),
    targetSavingsPercentage: z.number()
      .min(0, 'Savings percentage must be at least 0')
      .max(100, 'Savings percentage must not exceed 100'),
    primaryGoal: z.nativeEnum(UserGoal, {
      errorMap: () => ({ message: 'Invalid primary goal' }),
    }),
  }),
}); 