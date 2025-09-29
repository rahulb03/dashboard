import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constant';
import dataCache from '@/utils/DataCacheManager';
// Create Salary Configuration
export const createSalaryThunk = createAsyncThunk(
  'salary/createSalary',
  async (salaryData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.SALARY.CREATE,
        salaryData
      );
      const newSalary = response.data.data;

      // Add to individual salary cache
      dataCache.set('salary', newSalary, { salaryId: newSalary.id });

      // Add to salaries list cache
      dataCache.optimisticUpdate('salaries', (cachedSalaries) => {
        if (Array.isArray(cachedSalaries)) {
          return [newSalary, ...cachedSalaries];
        }
        return cachedSalaries;
      });

      // Invalidate employment type specific caches
      dataCache.invalidateType('salariesByEmploymentType');
      dataCache.invalidateType('searchSalaries');

      return newSalary;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to create salary configuration';
      const validationErrors = error?.response?.data?.data || {};
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Get All Salary Configurations
export const fetchSalariesThunk = createAsyncThunk(
  'salary/fetchSalaries',
  async ({ forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = {};

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('salaries', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const response = await axiosInstance.get(API_ENDPOINTS.SALARY.LIST);
      const data = response.data.data;

      // Update cache with new data
      dataCache.set('salaries', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch salary configurations';
      return rejectWithValue(message);
    }
  }
);

// Get Single Salary Configuration by ID
export const fetchSalaryByIdThunk = createAsyncThunk(
  'salary/fetchSalaryById',
  async ({ salaryId, forceRefresh = false }, { rejectWithValue }) => {
    try {
      const cacheKey = { salaryId };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('salary', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const response = await axiosInstance.get(
        API_ENDPOINTS.SALARY.GET_ONE(salaryId)
      );
      const data = response.data.data;

      // Update cache with new data
      dataCache.set('salary', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch salary configuration';
      return rejectWithValue(message);
    }
  }
);

// Update Salary Configuration
export const updateSalaryThunk = createAsyncThunk(
  'salary/updateSalary',
  async ({ salaryId, salaryData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.SALARY.UPDATE(salaryId),
        salaryData
      );
      const updatedSalary = response.data.data;

      // Update cache with new salary data
      dataCache.set('salary', updatedSalary, { salaryId });

      // Also update the salary in the salaries list cache
      dataCache.optimisticUpdate('salaries', (cachedSalaries) => {
        if (Array.isArray(cachedSalaries)) {
          return cachedSalaries.map((salary) =>
            salary.id === parseInt(salaryId)
              ? { ...salary, ...updatedSalary }
              : salary
          );
        }
        return cachedSalaries;
      });

      // Invalidate employment type specific caches
      dataCache.invalidateType('salariesByEmploymentType');
      dataCache.invalidateType('searchSalaries');

      return updatedSalary;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to update salary configuration';
      const validationErrors = error?.response?.data?.data || {};
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Delete Salary Configuration
export const deleteSalaryThunk = createAsyncThunk(
  'salary/deleteSalary',
  async (salaryId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.SALARY.DELETE(salaryId)
      );

      // Remove from individual salary cache
      dataCache.invalidate('salary', { salaryId });

      // Remove from salaries list cache
      dataCache.optimisticUpdate('salaries', (cachedSalaries) => {
        if (Array.isArray(cachedSalaries)) {
          return cachedSalaries.filter(
            (salary) => salary.id !== parseInt(salaryId)
          );
        }
        return cachedSalaries;
      });

      // Invalidate employment type specific caches
      dataCache.invalidateType('salariesByEmploymentType');
      dataCache.invalidateType('searchSalaries');

      return { salaryId, message: response.data.message };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to delete salary configuration';
      return rejectWithValue(message);
    }
  }
);

// Get Salaries by Employment Type
export const fetchSalariesByEmploymentTypeThunk = createAsyncThunk(
  'salary/fetchSalariesByEmploymentType',
  async ({ employmentType, forceRefresh = false }, { rejectWithValue }) => {
    try {
      const cacheKey = { employmentType };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('salariesByEmploymentType', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const response = await axiosInstance.get(API_ENDPOINTS.SALARY.LIST);
      const allSalaries = response.data.data;
      const filteredSalaries = allSalaries.filter(
        (salary) => salary.employmentType === employmentType
      );
      const result = { employmentType, salaries: filteredSalaries };

      // Update cache with filtered data
      dataCache.set('salariesByEmploymentType', result, cacheKey);

      return result;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch salaries by employment type';
      return rejectWithValue(message);
    }
  }
);

// Search Salaries (if needed)
export const searchSalariesThunk = createAsyncThunk(
  'salary/searchSalaries',
  async (
    { query, employmentType, forceRefresh = false },
    { rejectWithValue }
  ) => {
    try {
      const cacheKey = { query, employmentType };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('searchSalaries', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const response = await axiosInstance.get(API_ENDPOINTS.SALARY.LIST);
      const allSalaries = response.data.data;

      let filteredSalaries = allSalaries;

      // Filter by employment type if provided
      if (employmentType && employmentType !== 'all') {
        filteredSalaries = filteredSalaries.filter(
          (salary) => salary.employmentType === employmentType
        );
      }

      // Search by query if provided
      if (query) {
        const searchTerm = query.toLowerCase();
        filteredSalaries = filteredSalaries.filter(
          (salary) =>
            salary.employmentType.toLowerCase().includes(searchTerm) ||
            salary.minSalary.toString().includes(searchTerm) ||
            salary.maxSalary?.toString().includes(searchTerm) ||
            salary.loanAmount.toString().includes(searchTerm) ||
            salary.minCibilScore.toString().includes(searchTerm) ||
            salary.maxCibilScore?.toString().includes(searchTerm) ||
            salary.interestRate.toString().includes(searchTerm)
        );
      }

      // Update cache with search results
      dataCache.set('searchSalaries', filteredSalaries, cacheKey);

      return filteredSalaries;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to search salaries';
      return rejectWithValue(message);
    }
  }
);

// Bulk Delete Salaries
export const bulkDeleteSalariesThunk = createAsyncThunk(
  'salary/bulkDeleteSalaries',
  async (salaryIds, { rejectWithValue, dispatch }) => {
    try {
      const deletePromises = salaryIds.map((salaryId) =>
        dispatch(deleteSalaryThunk(salaryId))
      );

      const results = await Promise.allSettled(deletePromises);
      const successful = [];
      const failed = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(salaryIds[index]);
        } else {
          failed.push({ salaryId: salaryIds[index], error: result.reason });
        }
      });

      // Additional cache cleanup for bulk operations
      if (successful.length > 0) {
        // Remove all successful deletions from individual caches
        successful.forEach((salaryId) => {
          dataCache.invalidate('salary', { salaryId });
        });

        // Update the main salaries list cache
        dataCache.optimisticUpdate('salaries', (cachedSalaries) => {
          if (Array.isArray(cachedSalaries)) {
            return cachedSalaries.filter(
              (salary) => !successful.includes(salary.id)
            );
          }
          return cachedSalaries;
        });

        // Invalidate all related caches
        dataCache.invalidateType('salariesByEmploymentType');
        dataCache.invalidateType('searchSalaries');
      }

      return { successful, failed };
    } catch (error) {
      return rejectWithValue('Bulk delete operation failed');
    }
  }
);
