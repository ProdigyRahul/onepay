import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/apiError';

// General rate limiter for all routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});

// Stricter rate limiter for sensitive operations
export const sensitiveOperationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many sensitive operations from this IP, please try again later',
});

// Very strict rate limiter for PIN attempts
export const pinAttemptLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  handler: (_req, _res) => {
    throw new ApiError(429, 'Too many PIN attempts, please try again later');
  },
});
