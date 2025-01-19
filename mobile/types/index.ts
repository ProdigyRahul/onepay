export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: 'success' | 'error';
} 