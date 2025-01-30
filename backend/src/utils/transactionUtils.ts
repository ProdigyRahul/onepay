// Initialize generators as undefined
let generateAlphanumeric: (size?: number) => string;
let generateNumeric: (size?: number) => string;

// Initialize the generators using dynamic import
const initializeGenerators = async () => {
  const { customAlphabet } = await import('nanoid');
  generateAlphanumeric = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12);
  generateNumeric = customAlphabet('0123456789', 16);
};

// Initialize immediately
initializeGenerators().catch(console.error);

/**
 * Generates a unique 12-character transaction ID
 * Format: XXXXXXXXXXXX (12 characters, alphanumeric)
 */
export const generateTransactionId = async (): Promise<string> => {
  if (!generateAlphanumeric) {
    await initializeGenerators();
  }
  return generateAlphanumeric();
};

/**
 * Generates a unique 16-digit account number
 * Format: XXXXXXXXXXXXXXXX (16 digits)
 */
export const generateAccountNumber = async (): Promise<string> => {
  if (!generateNumeric) {
    await initializeGenerators();
  }
  return generateNumeric();
};
