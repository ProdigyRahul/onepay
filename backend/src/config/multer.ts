import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { ApiError } from '../utils/apiError';

// Ensure upload directory exists
const uploadDir = 'uploads/kyc';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) => {
    callback(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    callback(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});
