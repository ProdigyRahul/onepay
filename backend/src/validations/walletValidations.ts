import { body } from 'express-validator';

export const createWalletValidation = [
  body('pin')
    .isString()
    .withMessage('PIN must be 4-6 digits')
    .isLength({ min: 4, max: 6 })
    .withMessage('PIN must be 4-6 digits')
    .matches(/^\d+$/)
    .withMessage('PIN must be 4-6 digits'),
  body('currency')
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .isUppercase()
    .withMessage('Currency must be a valid 3-letter code (e.g., USD)'),
  body('dailyLimit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Daily limit must be a positive number'),
  body('monthlyLimit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly limit must be a positive number'),
];

export const addMoneyValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description must not exceed 255 characters'),
  body('type')
    .equals('CREDIT')
    .withMessage('Transaction type must be CREDIT for adding money'),
];

export const transferValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('receiverWalletId')
    .isString()
    .notEmpty()
    .withMessage('Receiver wallet ID is required'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description must not exceed 255 characters'),
  body('pin')
    .isString()
    .isLength({ min: 4, max: 6 })
    .matches(/^\d+$/)
    .withMessage('PIN must be 4-6 digits'),
];

export const updateLimitsValidation = [
  body('dailyLimit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Daily limit must be a positive number'),
  body('monthlyLimit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly limit must be a positive number'),
  body('pin')
    .isString()
    .isLength({ min: 4, max: 6 })
    .matches(/^\d+$/)
    .withMessage('PIN must be 4-6 digits'),
]; 