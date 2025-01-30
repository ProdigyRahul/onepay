import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Validating request body:', req.body);
    const result = await schema.parseAsync(req.body);
    console.log('Validation successful:', result);
    return next();
  } catch (error) {
    console.error('Validation error:', error);
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
        details: error.errors
      });
    }
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
    });
  }
};