import { KYCStatus } from './enums';

export interface KycStatusResponse {
  status: KYCStatus;
  panNumber: string;
  dateOfBirth: string;
  hasDocument: boolean;
}

export interface KycUploadResponse {
  message: string;
  status: KYCStatus;
}
