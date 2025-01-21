import { body } from 'express-validator';
import { IncomeRange, SpendingHabit, UserGoal } from '../types/onboarding';

export const profileValidation = [
  body('firstName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('panNumber')
    .isString()
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Invalid PAN number format'),
];

export const ageValidation = [
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Invalid date format. Use ISO8601 format (YYYY-MM-DD)')
    .custom((value) => {
      const dob = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      if (age < 18) {
        throw new Error('Must be at least 18 years old');
      }
      if (age > 100) {
        throw new Error('Invalid date of birth');
      }
      return true;
    }),
];

export const financialProfileValidation = [
  body('incomeRange')
    .isIn(Object.values(IncomeRange))
    .withMessage('Invalid income range'),
  body('targetSpendingPercentage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Target spending percentage must be between 0 and 100'),
  body('spendingHabit')
    .isIn(Object.values(SpendingHabit))
    .withMessage('Invalid spending habit'),
  body('targetSavingsPercentage')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Target savings percentage must be between 0 and 100')
    .custom((value, { req }) => {
      const total = value + req.body.targetSpendingPercentage;
      if (total > 100) {
        throw new Error('Total of spending and savings percentages cannot exceed 100%');
      }
      return true;
    }),
  body('primaryGoal')
    .isIn(Object.values(UserGoal))
    .withMessage('Invalid user goal'),
]; 