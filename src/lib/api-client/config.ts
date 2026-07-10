import axios from 'axios';

// Toggle this to false to connect directly to your C# .NET Web API
export const USE_MOCK = false;

// The base API URL, loaded from env variables
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5180/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage if exists
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally (e.g. 401 Unauthorized redirect)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    // Trích xuất thông điệp lỗi chi tiết từ API Backend kèm thông tin request
    const backendMessage = error.response?.data?.errorMessage || error.response?.data?.message;
    const requestInfo = error.config ? ` [${error.config.method?.toUpperCase()} ${error.config.url}]` : '';
    const finalError = backendMessage 
      ? new Error(`${backendMessage}${requestInfo}`) 
      : new Error(`${error.message}${requestInfo}`);
    return Promise.reject(finalError);
  }
);

// Helper function to simulate network delay for mock services
export const delay = (ms: number = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export default apiClient;
