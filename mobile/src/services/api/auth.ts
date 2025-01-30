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
  try {
    const response = await apiClient.post('/auth/otp/verify', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to verify OTP');
  }
};

export const generateOTP = async (phoneNumber: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await apiClient.post('/auth/otp/generate', { phoneNumber });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to generate OTP');
  }
};
