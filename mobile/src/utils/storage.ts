import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
} as const;

export const StorageUtils = {
  // Auth Token
  setAuthToken: (token: string) => {
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  getAuthToken: (): string | undefined => {
    return storage.getString(STORAGE_KEYS.AUTH_TOKEN);
  },

  // User Data
  setUserData: (userData: any) => {
    storage.set(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  },

  getUserData: () => {
    const data = storage.getString(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  // Clear all data
  clearStorage: () => {
    storage.clearAll();
  },
};

export default StorageUtils;
