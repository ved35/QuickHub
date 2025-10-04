import axios from 'axios';
import { showError, showWarning } from '../utils/toast';

// const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';


const baseURL = 'https://quickhub-dtjf.onrender.com/api' ;
// const baseURL = 'http://localhost:3000/api' 

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {

    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          localStorage.removeItem('authToken');
          showError(error.response.data.message);
          window.location.href = '/signin';
          break;
        case 403:
          console.error('❌ Forbidden: Access denied');
          showError('Access denied. You do not have permission to perform this action.');
          break;
        case 404:
          console.error('❌ Not Found: Resource not found');
          showError(error.response.data.message);
          break;
        case 500:
          console.error('❌ Server Error: Internal server error');
          showError('Server error. Please try again later.');
          break;
        default:
          console.error(`❌ API Error ${status}:`, data?.message || 'Unknown error');
          showError(data?.message || 'An unexpected error occurred. Please try again.');
      }
      
      console.error('❌ API Error Response:', {
        status,
        url: error.config?.url,
        data: data,
      });
    } else if (error.request) {
      console.error('❌ Network Error: No response received');
      showError('Network error. Please check your connection and try again.');
    } else {
      console.error('❌ Request Setup Error:', error.message);
      showError('Request failed. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
