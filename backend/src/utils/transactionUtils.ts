import { customAlphabet } from 'nanoid';

// Create a custom nanoid generator with numbers and uppercase letters
const generateAlphanumeric = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12);
const generateNumeric = customAlphabet('0123456789', 16);

/**
 * Generates a unique 12-character transaction ID
 * Format: XXXXXXXXXXXX (12 characters, alphanumeric)
 */
export const generateTransactionId = (): string => {
  return generateAlphanumeric();
};

/**
 * Generates a unique 16-digit account number
 * Format: XXXXXXXXXXXXXXXX (16 digits)
 */
export const generateAccountNumber = (): string => {
  return generateNumeric();
};
