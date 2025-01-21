import express, { RequestHandler } from 'express';
import { onboardingController } from '../controllers/onboardingController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  profileValidation,
  ageValidation,
  financialProfileValidation,
  primaryGoalValidation,
  incomeRangeValidation,
  spendingHabitsValidation,
} from '../validations/onboardingValidations';

const router = express.Router();

// All routes require authentication
router.use(authenticate as RequestHandler);

// Update profile information
router.post(
  '/profile',
  validate(profileValidation),
  onboardingController.updateProfile as RequestHandler
);

// Update age information
router.post(
  '/age',
  validate(ageValidation),
  onboardingController.updateAge as RequestHandler
);

// Update primary goal
router.post(
  '/primary-goal',
  validate(primaryGoalValidation),
  onboardingController.updatePrimaryGoal as RequestHandler
);

// Update income range
router.post(
  '/income-range',
  validate(incomeRangeValidation),
  onboardingController.updateIncomeRange as RequestHandler
);

// Update spending habits
router.post(
  '/spending-habits',
  validate(spendingHabitsValidation),
  onboardingController.updateSpendingHabits as RequestHandler
);

// Update complete financial profile (legacy)
router.post(
  '/financial-profile',
  validate(financialProfileValidation),
  onboardingController.updateFinancialProfile as RequestHandler
);

// Get onboarding status
router.get(
  '/status',
  onboardingController.getStatus as RequestHandler
);

export default router; 