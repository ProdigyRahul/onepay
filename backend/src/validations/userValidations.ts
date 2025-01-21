import { body } from 'express-validator';

export const updateProfileValidation = [
  body('firstName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
];

export const updateKYCValidation = [
  body('panNumber')
    .isString()
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Invalid PAN number format'),
  body('dateOfBirth')
    .isISO8601()
    .toDate()
    .withMessage('Invalid date format'),
  body('incomeRange')
    .isIn([
      'RANGE_0_12500',
      'RANGE_12500_25000',
      'RANGE_25000_50000',
      'RANGE_50000_150000',
      'RANGE_150000_300000',
      'RANGE_300000_2500000',
      'RANGE_2500000_PLUS',
    ])
    .withMessage('Invalid income range'),
  body('spendingType')
    .isIn(['SPEND_ALL', 'SPEND_NONE', 'SPEND_SOMETIMES'])
    .withMessage('Invalid spending type'),
  body('savingGoal')
    .isFloat({ min: 0 })
    .withMessage('Saving goal must be a positive number'),
  body('purposeType')
    .isIn(['PAYMENTS', 'LOANS', 'INVESTMENTS', 'TRACKING'])
    .withMessage('Invalid purpose type'),
]; 