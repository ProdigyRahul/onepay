import axios from 'axios';
import { API_CONFIG } from '../../config/api';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: string;
  phoneNumber: string;
  isVerified: boolean;
}

export interface GenerateOTPResponse {
  message: string;
  otp?: string; // Only in development
}

export interface VerifyOTPResponse {
  message: string;
  user: User;
}

export const generateOTP = async (phoneNumber: string): Promise<GenerateOTPResponse> => {
  const response = await api.post('/auth/generate-otp', { phoneNumber });
  return response.data;
};

export const verifyOTP = async (phoneNumber: string, otp: string): Promise<VerifyOTPResponse> => {
  const response = await api.post('/auth/verify-otp', { phoneNumber, otp });
  return response.data;
}; 