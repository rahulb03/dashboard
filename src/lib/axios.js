import axios from 'axios';
import { API_BASE_URL } from '@/config/constant';
// Replace this with your actual backend server URL

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
    (config) => {
      const token = getTokenFromStorage();

      if (token) {
        config.headers['token'] = `Bearer ${token}`; // Use appropriate key expected by your backend
      }

      if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }

      // Log request
      console.log('➡️ Axios Request:', {
        method: config.method,
        url: config.url,
        headers: config.headers,
        params: config.params,
        data: config.data,
      });

      return config;
    },
    (error) => {
      console.error('❌ Axios Request Error:', error);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      console.log('✅ Axios Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });

      return response;
    },
    (error) => {
      if (error.response) {
        console.error('❌ Axios Response Error:', {
          url: error.config?.url,
          status: error.response.status,
          data: error.response.data,
        });

        // Handle unauthorized responses
        if (error.response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('userdetail');
            // Redirect to login page
            window.location.href = '/login';
          }
        }
      } else {
        console.error('❌ Axios Network/Error:', error.message);
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
