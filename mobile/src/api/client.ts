import axios from 'axios';
import { API_CONFIG } from '../config/api';
import StorageUtils from '../utils/storage';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  async (config) => {
    const token = StorageUtils.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData content type
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
      // Prevent axios from trying to JSON stringify FormData
      config.transformRequest = [(data) => data];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear storage and trigger logout
      StorageUtils.clearStorage();
      store.dispatch(logout());

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
