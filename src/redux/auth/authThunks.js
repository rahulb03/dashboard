import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance, unauthenticatedAxios } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constant';
import { storeAuthData, clearStoredAuthData } from '@/lib/auth-utils';
import { mockAuthService } from '@/lib/mock-auth';
import dataCache from '@/utils/DataCacheManager';

const extractResponse = (data) => {
  const token = data?.data?.token || data?.token;
  const user = data?.data?.user || data?.user || data?.data || data;
  return { token, user };
};

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await unauthenticatedAxios.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    const { token, user } = extractResponse(response.data.data);
    
    if (!token || !user) throw new Error('Invalid login response');
    
    // Persist to localStorage for cross-session persistence
    storeAuthData(token, user);
    
    return { token, user };
  } catch (error) {
    // Try mock auth as fallback in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const mockResponse = await mockAuthService.login(email, password);
        const { token, user } = extractResponse(mockResponse.data);
        
        if (token && user) {
          storeAuthData(token, user);
          return { token, user };
        }
      } catch (mockError) {
        // Silent fallback failure
      }
    }
    
    const message = error?.response?.data?.message || error.message || 'Login failed';
    return rejectWithValue(message);
  }
});

export const signup = createAsyncThunk('auth/signup', async (userData, { rejectWithValue }) => {
  try {
    const response = await unauthenticatedAxios.post(API_ENDPOINTS.AUTH.SIGN_UP, userData);
    const { token, user } = extractResponse(response.data);
    if (!token || !user) throw new Error('Invalid signup response');
    
    // Persist to localStorage for cross-session persistence
    storeAuthData(token, user);
    
    return { token, user };
  } catch (error) {
    // Try mock auth as fallback in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const mockResponse = await mockAuthService.signup(userData);
        const { token, user } = extractResponse(mockResponse.data);
        
        if (token && user) {
          storeAuthData(token, user);
          return { token, user };
        }
      } catch (mockError) {
        // Silent fallback failure
      }
    }
    
    const message = error?.response?.data?.message || error.message || 'Signup failed';
    return rejectWithValue(message);
  }
});

export const getProfile = createAsyncThunk('auth/getProfile', async ({ forceRefresh = false } = {}, { rejectWithValue }) => {
  try {
    const cacheKey = { userId: 'current' };
    
    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cached = dataCache.get('userProfile', cacheKey);
      if (cached.cached) {
        return cached.data;
      }
    }
    
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.PROFILE);
    const { user } = extractResponse(response.data.data);
    if (!user) throw new Error('No user data found');
    
    // Update cache with new data
    dataCache.set('userProfile', user, cacheKey);
    
    return user;
  } catch (error) {
    // Try mock auth as fallback in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const mockResponse = await mockAuthService.getProfile();
        const user = mockResponse.data;
        
        if (user) {
          dataCache.set('userProfile', user, { userId: 'current' });
          return user;
        }
      } catch (mockError) {
        // Silent fallback failure
      }
    }
    
    const message = error?.response?.data?.message || error.message || 'Failed to fetch profile';
    return rejectWithValue(message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.UPDATE, profileData);
    const { user } = extractResponse(response.data.data);
    if (!user) throw new Error('Invalid profile update response');
    
    // Update cache with new user data
    dataCache.set('userProfile', user, { userId: 'current' });
    
    return user;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || 'Failed to update profile';
    return rejectWithValue(message);
  }
});

export const changePassword = createAsyncThunk('auth/changePassword', async ({ oldPassword, newPassword }, { rejectWithValue }) => {
  try {
    await axiosInstance.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, { oldPassword, newPassword });
    return;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || 'Failed to change password';
    return rejectWithValue(message);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.get(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    // Don't reject, just proceed with client-side logout
  } finally {
    // Always clear stored auth data on logout
    clearStoredAuthData();
    
    // Clear user profile cache
    dataCache.invalidate('userProfile', { userId: 'current' });
  }
});
