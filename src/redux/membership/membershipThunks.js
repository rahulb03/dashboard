import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constant';
import dataCache from '@/utils/DataCacheManager';

// Create Membership
export const createMembershipThunk = createAsyncThunk(
  'membership/createMembership',
  async (membershipData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.MEMBERSHIP.CREATE,
        membershipData
      );
      const newMembership = response.data.data;

      // Add to individual membership cache
      dataCache.set('membership', newMembership, { membershipId: newMembership.id });

      // Add to memberships list cache with optimistic update
      dataCache.optimisticUpdate('memberships', (cachedMemberships) => {
        if (Array.isArray(cachedMemberships.data?.memberships)) {
          return {
            ...cachedMemberships,
            data: {
              ...cachedMemberships.data,
              memberships: [newMembership, ...cachedMemberships.data.memberships]
            }
          };
        }
        return cachedMemberships;
      });

      // Invalidate stats cache to refresh statistics
      dataCache.invalidatePrefix('membershipStats');

      return newMembership;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to create membership';
      const validationErrors = error?.response?.data?.data || {};
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Get All Memberships with pagination and filtering
export const fetchMembershipsThunk = createAsyncThunk(
  'membership/fetchMemberships',
  async (
    { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '',
      isActive = null,
      startDateFrom = '',
      startDateTo = '',
      endDateFrom = '',
      endDateTo = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      forceRefresh = false 
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const cacheKey = { 
        page, 
        limit, 
        search, 
        status,
        isActive,
        startDateFrom,
        startDateTo, 
        endDateFrom,
        endDateTo,
        sortBy,
        sortOrder
      };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('memberships', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(status && { status }),
        ...(isActive !== null && { isActive: isActive.toString() }),
        ...(startDateFrom && { startDateFrom }),
        ...(startDateTo && { startDateTo }),
        ...(endDateFrom && { endDateFrom }),
        ...(endDateTo && { endDateTo })
      });

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.MEMBERSHIP.LIST}?${params}`
      );
      const data = response.data.data;

      // Update cache with new data
      dataCache.set('memberships', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch memberships';
      return rejectWithValue(message);
    }
  }
);

// Get Membership by ID
export const fetchMembershipByIdThunk = createAsyncThunk(
  'membership/fetchMembershipById',
  async ({ membershipId, forceRefresh = false }, { rejectWithValue }) => {
    try {
      const cacheKey = { membershipId };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('membership', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const response = await axiosInstance.get(
        API_ENDPOINTS.MEMBERSHIP.GET_ONE(membershipId)
      );
      const data = response.data.data;

      // Update cache with new data
      dataCache.set('membership', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch membership';
      return rejectWithValue(message);
    }
  }
);

// Get User's Own Membership
export const fetchUserMembershipThunk = createAsyncThunk(
  'membership/fetchUserMembership',
  async ({ forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = { type: 'user-membership' };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('userMembership', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const response = await axiosInstance.get(
        API_ENDPOINTS.MEMBERSHIP.GET_USER_MEMBERSHIP
      );
      const data = response.data.data;

      // Update cache with new data
      dataCache.set('userMembership', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch user membership';
      return rejectWithValue(message);
    }
  }
);

// Update Membership
export const updateMembershipThunk = createAsyncThunk(
  'membership/updateMembership',
  async ({ membershipId, membershipData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.MEMBERSHIP.UPDATE(membershipId),
        membershipData
      );
      const updatedMembership = response.data.data;

      // Update cache with new membership data
      dataCache.set('membership', updatedMembership, { membershipId });

      // Also update the membership in the memberships list cache
      dataCache.optimisticUpdate('memberships', (cachedMemberships) => {
        if (Array.isArray(cachedMemberships.data?.memberships)) {
          return {
            ...cachedMemberships,
            data: {
              ...cachedMemberships.data,
              memberships: cachedMemberships.data.memberships.map((membership) =>
                membership.id === parseInt(membershipId)
                  ? { ...membership, ...updatedMembership }
                  : membership
              )
            }
          };
        }
        return cachedMemberships;
      });

      // Invalidate stats cache to refresh statistics
      dataCache.invalidatePrefix('membershipStats');

      return updatedMembership;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to update membership';
      const validationErrors = error?.response?.data?.data || {};
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Delete Membership (Soft Delete - Cancel)
export const deleteMembershipThunk = createAsyncThunk(
  'membership/deleteMembership',
  async (membershipId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.MEMBERSHIP.DELETE(membershipId)
      );

      // Remove from individual membership cache
      dataCache.invalidate('membership', { membershipId });

      // Remove from memberships list cache with optimistic update
      dataCache.optimisticUpdate('memberships', (cachedMemberships) => {
        if (Array.isArray(cachedMemberships.data?.memberships)) {
          return {
            ...cachedMemberships,
            data: {
              ...cachedMemberships.data,
              memberships: cachedMemberships.data.memberships.map((membership) =>
                membership.id === parseInt(membershipId)
                  ? { ...membership, status: 'CANCELLED', isActive: false }
                  : membership
              )
            }
          };
        }
        return cachedMemberships;
      });

      // Invalidate stats cache to refresh statistics
      dataCache.invalidatePrefix('membershipStats');

      return { membershipId, message: response.data.message };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to cancel membership';
      return rejectWithValue(message);
    }
  }
);

// Bulk Update Memberships
export const bulkUpdateMembershipsThunk = createAsyncThunk(
  'membership/bulkUpdateMemberships',
  async (updateData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.MEMBERSHIP.BULK_UPDATE,
        updateData
      );
      const result = response.data.data;

      // Invalidate all related caches since this is a bulk operation
      dataCache.invalidatePrefix('membership');
      dataCache.invalidatePrefix('memberships');
      dataCache.invalidatePrefix('membershipStats');

      return result;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to bulk update memberships';
      const validationErrors = error?.response?.data?.data || {};
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Extend Membership
export const extendMembershipThunk = createAsyncThunk(
  'membership/extendMembership',
  async (extensionData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.MEMBERSHIP.EXTEND,
        extensionData
      );
      const extendedMembership = response.data.data;

      // Update membership in cache
      dataCache.set('membership', extendedMembership, { membershipId: extendedMembership.id });

      // Update user membership cache if this is the user's own membership
      dataCache.optimisticUpdate('userMembership', (cachedUserMembership) => {
        if (cachedUserMembership.data?.userId === extensionData.userId) {
          return {
            ...cachedUserMembership,
            data: extendedMembership
          };
        }
        return cachedUserMembership;
      });

      // Update memberships list cache
      dataCache.optimisticUpdate('memberships', (cachedMemberships) => {
        if (Array.isArray(cachedMemberships.data?.memberships)) {
          return {
            ...cachedMemberships,
            data: {
              ...cachedMemberships.data,
              memberships: cachedMemberships.data.memberships.map((membership) =>
                membership.userId === extensionData.userId
                  ? { ...membership, ...extendedMembership }
                  : membership
              )
            }
          };
        }
        return cachedMemberships;
      });

      // Invalidate stats cache to refresh statistics
      dataCache.invalidatePrefix('membershipStats');

      return extendedMembership;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to extend membership';
      const validationErrors = error?.response?.data?.data || {};
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Get Membership Statistics
export const fetchMembershipStatsThunk = createAsyncThunk(
  'membership/fetchMembershipStats',
  async (
    { dateFrom = '', dateTo = '', forceRefresh = false } = {},
    { rejectWithValue }
  ) => {
    try {
      const cacheKey = { dateFrom, dateTo };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('membershipStats', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.MEMBERSHIP.STATS}?${params}`
      );
      const data = response.data.data;

      // Update cache with new data
      dataCache.set('membershipStats', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch membership statistics';
      return rejectWithValue(message);
    }
  }
);

// Update Expired Memberships (Admin utility)
export const updateExpiredMembershipsThunk = createAsyncThunk(
  'membership/updateExpiredMemberships',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.MEMBERSHIP.UPDATE_EXPIRED
      );
      const result = response.data.data;

      // Invalidate all related caches since this updates multiple memberships
      dataCache.invalidatePrefix('membership');
      dataCache.invalidatePrefix('memberships');
      dataCache.invalidatePrefix('membershipStats');

      return result;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to update expired memberships';
      return rejectWithValue(message);
    }
  }
);

// Search Memberships
export const searchMembershipsThunk = createAsyncThunk(
  'membership/searchMemberships',
  async ({ query, page = 1, limit = 10, status = '' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        search: query,
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status })
      });

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.MEMBERSHIP.LIST}?${params}`
      );
      return response.data.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to search memberships';
      return rejectWithValue(message);
    }
  }
);