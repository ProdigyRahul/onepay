import express, { RequestHandler } from 'express';
import { onboardingController } from '../controllers/onboardingController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  profileValidation,
  ageValidation,
  financialProfileValidation,
} from '../validations/onboardingValidations';

const router = express.Router();

// All routes require authentication
router.use(authenticate as RequestHandler);

// Update profile information
router.post(
  '/profile',
  validate(profileValidation) as RequestHandler,
  onboardingController.updateProfile as RequestHandler
);

// Update age information
router.post(
  '/age',
  validate(ageValidation) as RequestHandler,
  onboardingController.updateAge as RequestHandler
);

// Update financial profile
router.post(
  '/financial-profile',
  validate(financialProfileValidation) as RequestHandler,
  onboardingController.updateFinancialProfile as RequestHandler
);

// Get onboarding status
router.get(
  '/status',
  onboardingController.getStatus as RequestHandler
);

export default router; 