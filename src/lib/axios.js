import axios from 'axios';
import { API_BASE_URL, SERVER_URL } from '@/config/constant';
// Using actual backend server

// Helper to get token from localStorage or Redux store
const getTokenFromStorage = () => {
  // Try to get from localStorage first (for SSR compatibility)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Attach interceptors to a given axios instance
function attachInterceptors(axiosInstance) {
  axiosInstance.interceptors.request.use(
    async (config) => {
      const token = getTokenFromStorage();

      if (token) {
        config.headers['token'] = `Bearer ${token}`; // Use appropriate key expected by your backend
      }

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
        }
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
}

// Create instances
export const axiosInstance = attachInterceptors(
  axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  })
);



export const uploadAxiosInstance = attachInterceptors(
  axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    },
  })
);

export const unauthenticatedAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    token: 'essentials',
    'Content-Type': 'application/json',
    Accept: '*/*',
  },
});
