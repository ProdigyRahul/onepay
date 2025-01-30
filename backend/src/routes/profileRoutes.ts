import express, { RequestHandler } from 'express';
import { profileController } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileValidation } from '../validations/userValidations';
import { generalLimiter } from '../middleware/rateLimit';

const router = express.Router();

// All routes require authentication
router.use(authenticate as RequestHandler);
router.use(generalLimiter);

// Get user profile with wallet info
router.get(
  '/',
  profileController.getProfile as RequestHandler
);

// Update user profile (email only)
router.patch(
  '/',
  validate(updateProfileValidation),
  profileController.updateProfile as RequestHandler
);

export default router;
