import { apiClient } from '../../api/client';

interface User {
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  role: string;
}

interface OTPVerificationResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export const verifyOTP = async (data: { phoneNumber: string; code: string }): Promise<OTPVerificationResponse> => {
  const response = await apiClient.post('/auth/verify-otp', data);
  return response.data;
};

export const generateOTP = async (phoneNumber: string) => {
  const response = await apiClient.post('/auth/generate-otp', { phoneNumber });
  return response.data;
}; 