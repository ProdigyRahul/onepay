import express, { RequestHandler } from 'express';
import { walletController } from '../controllers/walletController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { generalLimiter, sensitiveOperationsLimiter, pinAttemptLimiter } from '../middleware/rateLimit';
import {
  createWalletValidation,
  transferValidation,
} from '../validations/walletValidations';

const router = express.Router();

// All routes require authentication and general rate limiting
router.use(authenticate as RequestHandler);
router.use(generalLimiter);

// Create new wallet - sensitive operation
router.post(
  '/',
  sensitiveOperationsLimiter,
  validate(createWalletValidation),
  walletController.createWallet as RequestHandler
);

// Get wallet details
router.get(
  '/',
  walletController.getWallet as RequestHandler
);

// Get wallet balance (quick endpoint)
router.get(
  '/balance',
  walletController.getWalletBalance as RequestHandler
);

// Get wallet stats for dashboard
router.get(
  '/stats',
  walletController.getWalletStats as RequestHandler
);

// Transfer money between wallets - sensitive operation with PIN
router.post(
  '/transfer',
  sensitiveOperationsLimiter,
  pinAttemptLimiter,
  validate(transferValidation),
  walletController.transfer as RequestHandler
);

export default router;