import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_ENDPOINTS.baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh if it's an auth error and we haven't tried yet
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await fetch(API_ENDPOINTS.refreshToken, {
          method: 'POST',
          credentials: 'include',
        });
        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', data.token);
          originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    // Don't redirect automatically, let the component handle it
    return Promise.reject(error);
  }
);

export default axiosInstance;