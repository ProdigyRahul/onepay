import express, { RequestHandler } from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateProfileValidation,
  updateKYCValidation,
} from '../validations/userValidations';

const router = express.Router();

// Protected routes
router.use(authenticate as RequestHandler);

// Get user profile
router.get('/profile', userController.getProfile as RequestHandler);

// Update user profile
router.put(
  '/profile',
  validate(updateProfileValidation) as RequestHandler,
  userController.updateProfile as RequestHandler
);

// KYC routes
router.post(
  '/kyc',
  validate(updateKYCValidation) as RequestHandler,
  userController.updateKYC as RequestHandler
);
router.get('/kyc', userController.getKYCStatus as RequestHandler);

export default router; 