import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constant';
import dataCache from '@/Utils/DataCacheManager';

// Create User
export const createMemberThunk = createAsyncThunk(
  'member/createMember',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.MEMBER.CREATE, userData);
      const newUser = response.data.data;
      
      // Add to individual member cache
      dataCache.set('member', newUser, { userId: newUser.id });
      
      // Add to members list cache
      dataCache.optimisticUpdate('members', (cachedMembers) => {
        if (Array.isArray(cachedMembers.data)) {
          return {
            ...cachedMembers,
            data: [newUser, ...cachedMembers.data]
          };
        }
        return cachedMembers;
      });
      
      return newUser;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to create user';
      const validationErrors = error?.response?.data?.data || {};
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Get All Users with pagination
export const fetchMembersThunk = createAsyncThunk(
  'member/fetchMembers',
  async ({ page = 1, limit = 10, search = '', forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = { page, limit, search };
      
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('members', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });
      
      const response = await axiosInstance.get(API_ENDPOINTS.MEMBER.LIST);
      const data = response.data.data;
      
      // Update cache with new data
      dataCache.set('members', data, cacheKey);
      
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch users';
      return rejectWithValue(message);
    }
  }
);

// Get User by ID
export const fetchMemberByIdThunk = createAsyncThunk(
  'member/fetchMemberById',
  async ({ userId, forceRefresh = false }, { rejectWithValue }) => {
    try {
      const cacheKey = { userId };
      
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('member', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }
      
      const response = await axiosInstance.get(API_ENDPOINTS.MEMBER.GET_ONE(userId));
      const data = response.data.data;
      
      // Update cache with new data
      dataCache.set('member', data, cacheKey);
      
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch user';
      return rejectWithValue(message);
    }
  }
);

// Update User
export const updateMemberThunk = createAsyncThunk(
  'member/updateMember',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.MEMBER.UPDATE(userId), userData);
      const updatedUser = response.data.data;
      
      // Update cache with new user data
      dataCache.set('member', updatedUser, { userId });
      
      // Also update the member in the members list cache
      dataCache.optimisticUpdate('members', (cachedMembers) => {
        if (Array.isArray(cachedMembers.data)) {
          return {
            ...cachedMembers,
            data: cachedMembers.data.map(member => 
              member.id === parseInt(userId) ? { ...member, ...updatedUser } : member
            )
          };
        }
        return cachedMembers;
      });
      
      return updatedUser;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to update user';
      const validationErrors = error?.response?.data?.data || {};
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Delete User (Soft Delete)
export const deleteMemberThunk = createAsyncThunk(
  'member/deleteMember',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.MEMBER.DELETE(userId));
      
      // Remove from individual member cache
      dataCache.invalidate('member', { userId });
      
      // Remove from members list cache
      dataCache.optimisticUpdate('members', (cachedMembers) => {
        if (Array.isArray(cachedMembers.data)) {
          return {
            ...cachedMembers,
            data: cachedMembers.data.filter(member => member.id !== parseInt(userId))
          };
        }
        return cachedMembers;
      });
      
      return { userId, message: response.data.message };
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to delete user';
      return rejectWithValue(message);
    }
  }
);

// Assign Role to User
export const assignRoleThunk = createAsyncThunk(
  'member/assignRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.MEMBER.ASSIGN_ROLE, {
        userId: parseInt(userId),
        role: role.toUpperCase()
      });
      return response.data.data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to assign role';
      const validationErrors = error?.response?.data?.data || {};
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Get Users by Role
export const fetchMembersByRoleThunk = createAsyncThunk(
  'member/fetchMembersByRole',
  async ({ role, page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await axiosInstance.get(`${API_ENDPOINTS.MEMBER.GET_BY_ROLE(role)}?${params}`);
      return response.data.data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch users by role';
      return rejectWithValue(message);
    }
  }
);

// Bulk Delete Users
export const bulkDeleteMembersThunk = createAsyncThunk(
  'member/bulkDeleteMembers',
  async (userIds, { rejectWithValue, dispatch }) => {
    try {
      const deletePromises = userIds.map(userId => 
        dispatch(deleteMemberThunk(userId))
      );
      
      const results = await Promise.allSettled(deletePromises);
      const successful = [];
      const failed = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(userIds[index]);
        } else {
          failed.push({ userId: userIds[index], error: result.reason });
        }
      });
      
      return { successful, failed };
    } catch (error) {
      return rejectWithValue('Bulk delete operation failed');
    }
  }
);

// Search Members
export const searchMembersThunk = createAsyncThunk(
  'member/searchMembers',
  async ({ query, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        search: query,
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await axiosInstance.get(`${API_ENDPOINTS.MEMBER.LIST}?${params}`);
      return response.data.data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to search users';
      return rejectWithValue(message);
    }
  }
);
