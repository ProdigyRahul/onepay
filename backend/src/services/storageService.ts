import axios from 'axios';
import FormData from 'form-data';
import { ApiError } from '../utils/apiError';

const STORAGE_API_URL = process.env.STORAGE_API_URL || 'http://23.94.74.248:3000';
const STORAGE_API_KEY = process.env.STORAGE_API_KEY || 'iamgay';

interface StorageResponse {
  success: boolean;
  file: {
    url: string;
    filename: string;
    size: number;
  };
}

export const storageService = {
  uploadFile: async (file: Express.Multer.File): Promise<StorageResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const response = await axios.post<StorageResponse>(
        `${STORAGE_API_URL}/upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'x-api-key': STORAGE_API_KEY,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error uploading file to storage:', error);
      throw new ApiError(500, 'Failed to upload file to storage');
    }
  },

  getFileUrl: (filename: string): string => {
    return `${STORAGE_API_URL}/files/${filename}`;
  },
};
