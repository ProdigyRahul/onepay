import express, { RequestHandler } from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateProfileValidation,
  updateKYCValidation,
} from '../validations/userValidations';

const router = express.Router();

// All routes require authentication
router.use(authenticate as RequestHandler);

// Get user profile
router.get('/profile', userController.getProfile as RequestHandler);

// Update user profile
router.patch(
  '/profile',
  validate(updateProfileValidation),
  userController.updateProfile as RequestHandler
);

// Update KYC information
router.post(
  '/kyc',
  validate(updateKYCValidation),
  userController.updateKYC as RequestHandler
);

// Get KYC status
router.get(
  '/kyc',
  userController.getKYCStatus as RequestHandler
);

export default router; 