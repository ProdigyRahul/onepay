import { z } from 'zod';

export const updateProfileValidation = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
});

export const updateKYCValidation = z.object({
  body: z.object({
    panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format'),
    dateOfBirth: z.string().datetime('Invalid date format'),
    address: z.string().min(10, 'Address must be at least 10 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    pincode: z.string().regex(/^[0-9]{6}$/, 'Invalid pincode format'),
  }),
}); 