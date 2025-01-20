export const API_CONFIG = {
  // Change this to your API URL
  BASE_URL: __DEV__ 
    ? 'http://192.168.186.202:5000/api' // Local Development
    : 'http://192.168.186.202:5000/api', // Production URL
} as const;