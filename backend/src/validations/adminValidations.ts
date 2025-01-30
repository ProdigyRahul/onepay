import { z } from 'zod';
import { KYCStatus } from '@prisma/client';

export const updateKycStatusValidation = z.object({
  status: z.nativeEnum(KYCStatus),
  remarks: z.string().min(1, 'Remarks are required for KYC verification'),
});
