import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('=== Validation Start ===');
    console.log('Raw request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('Validation schema:', schema);

    // Check if body exists
    if (!req.body) {
      console.error('Request body is undefined');
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
      });
    }

    // Directly validate the request body
    console.log('Data to validate:', req.body);
    const result = await schema.parseAsync(req.body);
    console.log('Validation successful:', result);
    
    // Store validated data back in request
    req.body = result;
    console.log('Updated request body:', req.body);
    console.log('=== Validation End ===');
    
    return next();
  } catch (error) {
    console.error('=== Validation Error ===');
    console.error('Error details:', error);
    
    if (error instanceof ZodError) {
      console.error('Zod validation errors:', {
        errors: error.errors,
        formattedErrors: error.format(),
      });
      
      return res.status(400).json({
        success: false,
        error: error.errors[0]?.message || 'Validation failed',
        details: error.errors
      });
    }
    
    console.error('Non-Zod error:', error);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
    });
  }
};