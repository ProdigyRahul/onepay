import Constants from 'expo-constants';
import { ApiResponse } from '../types';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5000/api';

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    return {
      data,
      status: response.ok ? 'success' : 'error',
      ...(response.ok ? {} : { error: data.error }),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 'error',
    };
  }
} 