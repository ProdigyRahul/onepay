import { Router, RequestHandler } from 'express';
import { generateOTP, verifyOTP } from '../controllers/authController';

const router = Router();

router.post('/generate-otp', generateOTP as RequestHandler);
router.post('/verify-otp', verifyOTP as RequestHandler);

export default router; 