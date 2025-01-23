import multer from 'multer';
import { Request } from 'express';
import { ApiError } from '../utils/apiError';

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new ApiError(400, 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.') as unknown as Error);
  }
};

// Export multer configuration
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});
