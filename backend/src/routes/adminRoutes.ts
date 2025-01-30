import express, { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { adminController } from '../controllers/adminController';
import { validate } from '../middleware/validate';
import { updateKycStatusValidation } from '../validations/adminValidations';
import { adminAuth } from '../middleware/adminAuth';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate as RequestHandler);
router.use(adminAuth as RequestHandler);

// KYC Management Routes
router.get('/kyc/pending', asyncHandler(adminController.getPendingKycApplications));
router.post(
  '/kyc/:userId/verify',
  validate(updateKycStatusValidation),
  asyncHandler(adminController.updateKycStatus)
);

export default router;
