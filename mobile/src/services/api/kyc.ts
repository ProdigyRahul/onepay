import { apiClient } from '../../api/client';

interface KycUploadResponse {
  success: boolean;
  message: string;
  data?: {
    documentId: string;
    status: string;
  };
}

interface KycStatusResponse {
  success: boolean;
  message: string;
  data?: {
    status: string;
    documents: {
      type: string;
      status: string;
      documentId: string;
    }[];
  };
}

export const kycApi = {
  uploadPanCard: async (formData: FormData): Promise<KycUploadResponse> => {
    console.log('Uploading PAN card with formData:', JSON.stringify(formData));
    try {
      const response = await apiClient.post<KycUploadResponse>('/kyc/upload/pan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading PAN card:', error);
      throw error;
    }
  },

  getKycStatus: async (): Promise<KycStatusResponse> => {
    try {
      const response = await apiClient.get<KycStatusResponse>('/kyc/status');
      console.log('KYC status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting KYC status:', error);
      throw error;
    }
  },
};
