import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Get the first error message
    const firstError = errors.array()[0];
    const errorMessage = 'msg' in firstError ? firstError.msg : 'Validation failed';

    return res.status(400).json({
      success: false,
      error: errorMessage,
    });
  };
}; 