import express, { RequestHandler } from 'express';
import { kycController } from '../controllers/kycController';
import { authenticate } from '../middleware/auth';
import { upload } from '../config/multer';
import { asyncHandler } from '../utils/asyncHandler';
import { FileRequest, AuthenticatedRequest } from '../types';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate as RequestHandler);

// Upload PAN card document
router.post(
  '/upload/pan',
  upload.single('panCard') as RequestHandler,
  asyncHandler<FileRequest>(kycController.uploadPanCard)
);

// Get KYC status
router.get('/status', asyncHandler<AuthenticatedRequest>(kycController.getKycStatus));

// Admin: Update KYC status
router.post('/admin/update-status', asyncHandler<AuthenticatedRequest>(kycController.updateKycStatus));

export default router;
