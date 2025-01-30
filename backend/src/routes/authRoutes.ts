import express from 'express';
import { generateOTP, verifyOTP, adminLogin } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { adminLoginValidation } from '../validations/authValidations';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// Debug middleware for admin login
router.use('/admin/login', (req, _res, next) => {
  console.log('Debug - Request body:', req.body);
  console.log('Debug - Content-Type:', req.headers['content-type']);
  next();
});

// Regular user auth routes - new endpoints
router.post('/otp/generate', asyncHandler(generateOTP));
router.post('/otp/verify', asyncHandler(verifyOTP));

// Regular user auth routes - legacy endpoints (for backward compatibility)
router.post('/generate-otp', asyncHandler(generateOTP)); // Keep old endpoint
router.post('/verify-otp', asyncHandler(verifyOTP));    // Keep old endpoint

// Admin auth routes
router.post('/admin/login', validate(adminLoginValidation), asyncHandler(adminLogin));

export default router;