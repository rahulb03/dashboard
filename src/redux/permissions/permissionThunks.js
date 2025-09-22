import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constant';
import dataCache from '../../Utils/DataCacheManager';
import { OptimisticUpdates } from '../../Utils/OptimisticUpdates';

// Fetch all users with their permissions
export const fetchUsersWithPermissions = createAsyncThunk(
  'permissions/fetchUsers',
  async ({ search = '', role = '', forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = { search, role };
      
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('users', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      
      const response = await axiosInstance.get(`${API_ENDPOINTS.PERMISSIONS.USERS_WITH_PERMISSIONS}?${params}`);
      const apiData = response.data.data;
      
      // Debug: Log the exact API response structure
      console.log('🔍 API Response Debug:', {
        fullResponse: response.data,
        extractedData: apiData,
        dataType: typeof apiData,
        isArray: Array.isArray(apiData),
        hasUsers: apiData?.users ? true : false,
        usersLength: apiData?.users?.length,
        dataKeys: apiData ? Object.keys(apiData) : 'no keys'
      });
      
      // Extract the users array from the nested structure
      // API returns: { data: { users: [...], total: n, filters: {...} } }
      const data = apiData?.users || apiData || [];
      
      // Update cache with new data
      dataCache.set('users', data, cacheKey);
      
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch users';
      return rejectWithValue(message);
    }
  }
);

// Fetch available permissions grouped by category
export const fetchAvailablePermissions = createAsyncThunk(
  'permissions/fetchAvailable',
  async ({ forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = {};
      
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('permissions', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }
      
      const response = await axiosInstance.get(API_ENDPOINTS.PERMISSIONS.AVAILABLE_PERMISSIONS);
      const data = response.data.data;
      
      // Debug: Log the exact API response structure for permissions
      console.log('🔍 Permissions API Response Debug:', {
        fullResponse: response.data,
        extractedData: data,
        dataType: typeof data,
        hasCategories: data?.categories ? true : false,
        categoriesLength: data?.categories?.length,
        totalPermissions: data?.totalPermissions
      });
      
      // Update cache with new data
      dataCache.set('permissions', data, cacheKey);
      
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch permissions';
      return rejectWithValue(message);
    }
  }
);

// Grant permission to a user
export const grantPermission = createAsyncThunk(
  'permissions/grant',
  async ({ userId, permissionId, expiresInDays, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.PERMISSIONS.GRANT, {
        userId,
        permissionId,
        expiresInDays,
        reason
      });
      
      // No need for optimistic updates here - they're handled in the component
      // The cache is already updated optimistically before this API call
      
      return response.data;
    } catch (error) {
      // Revert optimistic updates on error by refreshing user cache
      try {
        // Invalidate user cache to trigger fresh fetch
        dataCache.invalidateType('users');
      } catch (cacheError) {
        console.warn('Failed to invalidate cache after permission grant error:', cacheError);
      }
      
      const message = error?.response?.data?.message || error.message || 'Failed to grant permission';
      const validationErrors = error?.response?.data?.data || {};
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Revoke permission from a user
export const revokePermission = createAsyncThunk(
  'permissions/revoke',
  async ({ userId, permissionId, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.PERMISSIONS.REVOKE, {
        userId,
        permissionId,
        reason
      });
      
      // No need for optimistic updates here - they're handled in the component
      // The cache is already updated optimistically before this API call
      
      return response.data;
    } catch (error) {
      // Revert optimistic updates on error by refreshing user cache
      try {
        // Invalidate user cache to trigger fresh fetch
        dataCache.invalidateType('users');
      } catch (cacheError) {
        console.warn('Failed to invalidate cache after permission revoke error:', cacheError);
      }
      
      const message = error?.response?.data?.message || error.message || 'Failed to revoke permission';
      const validationErrors = error?.response?.data?.data || {};
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Fetch permission history for a user
export const fetchUserPermissionHistory = createAsyncThunk(
  'permissions/fetchHistory',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PERMISSIONS.HISTORY(userId));
      return response.data.data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch permission history';
      return rejectWithValue(message);
    }
  }
);
