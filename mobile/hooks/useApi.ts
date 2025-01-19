import { useState, useCallback } from 'react';
import { fetchApi } from '../services/api';
import { ApiResponse } from '../types';

export function useApi<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const request = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    setLoading(true);
    setError(null);

    const response = await fetchApi<T>(endpoint, options);

    setLoading(false);
    if (response.status === 'error') {
      setError(response.error || 'Something went wrong');
      return null;
    }

    setData(response.data || null);
    return response.data;
  }, []);

  return {
    loading,
    error,
    data,
    request,
  };
} 