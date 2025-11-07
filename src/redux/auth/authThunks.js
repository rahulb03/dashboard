import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance, unauthenticatedAxios } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constant';
import { mockAuthService } from '@/lib/mock-auth';
import dataCache from '@/utils/DataCacheManager';

const extractResponse = (data) => {
  // With cookie-based auth, token is not returned in response
  const user = data?.data?.user || data?.user || data?.data || data;
  return { user };
};

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
  //  console.log('🔐 Login attempt:', { email });
    const response = await unauthenticatedAxios.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  //  console.log('📥 Login response:', response.data);
    
    const { user } = extractResponse(response.data);
 //   console.log('👤 Extracted user:', user);
    
    if (!user) {
    //  console.error('❌ No user found in response:', response.data);
      throw new Error('Invalid login response');
    }
    
    // ROLE VALIDATION: Only allow ADMIN, MANAGER, and EMPLOYEE
    const allowedRoles = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
    const userRole = user.role || user.userRole || user.type;
  //  console.log('🔍 User role:', userRole);
    
    if (!allowedRoles.includes(userRole)) {
      console.error('❌ Invalid role:', userRole);
      return rejectWithValue(
        `Access denied. Only ADMIN, MANAGER, and EMPLOYEE roles can sign in to the dashboard. Your role: ${userRole || 'USER'}`
      );
    }
    
    // Cookie is automatically set by the server with httpOnly flag
   // console.log('✅ Login successful, returning user');
    return { user };
  } catch (error) {
    // Try mock auth as fallback in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const mockResponse = await mockAuthService.login(email, password);
        const { user } = extractResponse(mockResponse.data);
        
        if (user) {
          // ROLE VALIDATION for mock auth too
          const allowedRoles = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
          const userRole = user.role || user.userRole || user.type;
          
          if (!allowedRoles.includes(userRole)) {
            return rejectWithValue(
              `Access denied. Only ADMIN, MANAGER, and EMPLOYEE roles can sign in to the dashboard. Your role: ${userRole || 'USER'}`
            );
          }
          
          return { user };
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
    const { user } = extractResponse(response.data);
    if (!user) throw new Error('Invalid signup response');
    
    // Cookie is automatically set by the server with httpOnly flag
    return { user };
  } catch (error) {
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
    
    // ROLE VALIDATION: Check if user has allowed role
    const allowedRoles = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
    const userRole = user.role || user.userRole || user.type;
    
    if (!allowedRoles.includes(userRole)) {
      throw new Error(
        `Access denied. Only ADMIN, MANAGER, and EMPLOYEE roles can access the dashboard. Your role: ${userRole || 'USER'}`
      );
    }
    
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
          // ROLE VALIDATION for mock profile too
          const allowedRoles = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
          const userRole = user.role || user.userRole || user.type;
          
          if (!allowedRoles.includes(userRole)) {
            throw new Error(
              `Access denied. Only ADMIN, MANAGER, and EMPLOYEE roles can access the dashboard. Your role: ${userRole || 'USER'}`
            );
          }
          
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

export const updateProfilePhoto = createAsyncThunk('auth/updateProfilePhoto', async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    
    const response = await axiosInstance.patch(API_ENDPOINTS.AUTH.PHOTO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const { user } = extractResponse(response.data.data);
    if (!user) throw new Error('Invalid profile photo update response');
    
    // Update cache with new user data
    dataCache.set('userProfile', user, { userId: 'current' });
    
    return user;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || 'Failed to update profile photo';
    return rejectWithValue(message);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.get(API_ENDPOINTS.AUTH.LOGOUT);
    // Cookie is automatically cleared by the server
  } catch (error) {
    // Don't reject, just proceed with client-side logout
  } finally {
    // Clear user profile cache
    dataCache.invalidate('userProfile', { userId: 'current' });
  }
});
