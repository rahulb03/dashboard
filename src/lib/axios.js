import axios from 'axios';
import { API_BASE_URL } from '@/config/constant';

// Attach interceptors to a given axios instance
function attachInterceptors(axiosInstance) {
  axiosInstance.interceptors.request.use(
    (config) => {
      // Cookies are automatically sent with credentials: 'include'
      // No need to manually add auth headers
      
      if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response) {
        // Handle unauthorized responses - but don't auto-logout
        if (error.response.status === 401) {
          // Let the application handle this through Redux/auth state
          // Consider redirecting to login or refreshing token
        }
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
}

// Create instances with credentials enabled for cookie support
export const axiosInstance = attachInterceptors(
  axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Enable cookies
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  })
);

export const uploadAxiosInstance = attachInterceptors(
  axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Enable cookies
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    },
  })
);

export const unauthenticatedAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable cookies for login/signup
  headers: {
    'Content-Type': 'application/json',
    Accept: '*/*',
  },
});
