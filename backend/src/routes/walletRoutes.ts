import express, { RequestHandler } from 'express';
import { walletController } from '../controllers/walletController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createWalletValidation,
  addMoneyValidation,
  transferValidation,
  updateLimitsValidation,
} from '../validations/walletValidations';

const router = express.Router();

// Protected routes
router.use(authenticate as RequestHandler);

// Create wallet
router.post(
  '/',
  validate(createWalletValidation) as RequestHandler,
  walletController.createWallet as RequestHandler
);

// Get wallet details
router.get(
  '/:walletId',
  walletController.getWallet as RequestHandler
);

// Add money to wallet
router.post(
  '/:walletId/add',
  validate(addMoneyValidation) as RequestHandler,
  walletController.addMoney as RequestHandler
);

// Transfer money
router.post(
  '/:walletId/transfer',
  validate(transferValidation) as RequestHandler,
  walletController.transfer as RequestHandler
);

// Update wallet limits
router.put(
  '/:walletId/limits',
  validate(updateLimitsValidation) as RequestHandler,
  walletController.updateLimits as RequestHandler
);

export default router; 