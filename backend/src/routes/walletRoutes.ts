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

// All routes require authentication
router.use(authenticate as RequestHandler);

// Create new wallet
router.post(
  '/',
  validate(createWalletValidation),
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
  validate(addMoneyValidation),
  walletController.addMoney as RequestHandler
);

// Transfer money between wallets
router.post(
  '/:walletId/transfer',
  validate(transferValidation),
  walletController.transfer as RequestHandler
);

// Update wallet limits
router.patch(
  '/:walletId/limits',
  validate(updateLimitsValidation),
  walletController.updateLimits as RequestHandler
);

export default router; 