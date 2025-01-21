import { z } from 'zod';

export const createWalletValidation = z.object({
  body: z.object({
    type: z.enum(['SAVINGS', 'CURRENT', 'BUSINESS'], {
      errorMap: () => ({ message: 'Invalid wallet type' }),
    }),
    currency: z.enum(['INR', 'USD'], {
      errorMap: () => ({ message: 'Invalid currency' }),
    }),
  }),
});

export const addMoneyValidation = z.object({
  body: z.object({
    amount: z.number()
      .min(1, 'Amount must be at least 1')
      .max(1000000, 'Amount must not exceed 1000000'),
    paymentMethod: z.enum(['UPI', 'CARD', 'NETBANKING'], {
      errorMap: () => ({ message: 'Invalid payment method' }),
    }),
  }),
});

export const transferValidation = z.object({
  body: z.object({
    amount: z.number()
      .min(1, 'Amount must be at least 1')
      .max(1000000, 'Amount must not exceed 1000000'),
    toWalletId: z.string().uuid('Invalid wallet ID'),
    description: z.string().max(100, 'Description must not exceed 100 characters').optional(),
  }),
});

export const updateLimitsValidation = z.object({
  body: z.object({
    dailyLimit: z.number()
      .min(1000, 'Daily limit must be at least 1000')
      .max(1000000, 'Daily limit must not exceed 1000000')
      .optional(),
    monthlyLimit: z.number()
      .min(5000, 'Monthly limit must be at least 5000')
      .max(5000000, 'Monthly limit must not exceed 5000000')
      .optional(),
  }),
}); 