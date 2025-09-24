import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constant';
import dataCache from '../../utils/DataCacheManager';

// Create Payment Configuration
export const createPaymentConfigThunk = createAsyncThunk(
  'paymentConfig/createPaymentConfig',
  async (paymentConfigData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.PAYMENT_CONFIG.CREATE, paymentConfigData);
      const newPaymentConfig = response.data.data;
      
      // Add to individual payment config cache
      dataCache.set('paymentConfig', newPaymentConfig, { paymentConfigId: newPaymentConfig.id });
      
      // Add to payment configs list cache
      dataCache.optimisticUpdate('paymentConfigs', (cachedConfigs) => {
        if (Array.isArray(cachedConfigs)) {
          return [newPaymentConfig, ...cachedConfigs];
        }
        return cachedConfigs;
      });
      
      return newPaymentConfig;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to create payment configuration';
      const validationErrors = error?.response?.data?.data || {};
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Get All Payment Configurations
export const fetchPaymentConfigsThunk = createAsyncThunk(
  'paymentConfig/fetchPaymentConfigs',
  async ({ type = '', isActive = '', forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = { type, isActive };
      
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('paymentConfigs', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }
      
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (isActive !== '') params.append('isActive', isActive);
      
      const response = await axiosInstance.get(`${API_ENDPOINTS.PAYMENT_CONFIG.LIST}?${params}`);
      const data = response.data.data;
      
      // Update cache with new data
      dataCache.set('paymentConfigs', data, cacheKey);
      
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch payment configurations';
      return rejectWithValue(message);
    }
  }
);

// Get Single Payment Configuration by ID
export const fetchPaymentConfigByIdThunk = createAsyncThunk(
  'paymentConfig/fetchPaymentConfigById',
  async ({ paymentConfigId, forceRefresh = false }, { rejectWithValue }) => {
    try {
      const cacheKey = { paymentConfigId };
      
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('paymentConfig', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }
      
      const response = await axiosInstance.get(API_ENDPOINTS.PAYMENT_CONFIG.GET_ONE(paymentConfigId));
      const data = response.data.data;
      
      // Update cache with new data
      dataCache.set('paymentConfig', data, cacheKey);
      
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch payment configuration';
      return rejectWithValue(message);
    }
  }
);

// Update Payment Configuration
export const updatePaymentConfigThunk = createAsyncThunk(
  'paymentConfig/updatePaymentConfig',
  async ({ paymentConfigId, paymentConfigData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.PAYMENT_CONFIG.UPDATE(paymentConfigId), paymentConfigData);
      const updatedPaymentConfig = response.data.data;
      
      // Update cache with new payment config data
      dataCache.set('paymentConfig', updatedPaymentConfig, { paymentConfigId });
      
      // Also update the payment config in the payment configs list cache
      dataCache.optimisticUpdate('paymentConfigs', (cachedConfigs) => {
        if (Array.isArray(cachedConfigs)) {
          return cachedConfigs.map(config => 
            config.id === parseInt(paymentConfigId) ? { ...config, ...updatedPaymentConfig } : config
          );
        }
        return cachedConfigs;
      });
      
      return updatedPaymentConfig;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to update payment configuration';
      const validationErrors = error?.response?.data?.data || {};
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Delete Payment Configuration
export const deletePaymentConfigThunk = createAsyncThunk(
  'paymentConfig/deletePaymentConfig',
  async (paymentConfigId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(API_ENDPOINTS.PAYMENT_CONFIG.DELETE(paymentConfigId));
      
      // Remove from individual payment config cache
      dataCache.invalidate('paymentConfig', { paymentConfigId });
      
      // Remove from payment configs list cache
      dataCache.optimisticUpdate('paymentConfigs', (cachedConfigs) => {
        if (Array.isArray(cachedConfigs)) {
          return cachedConfigs.filter(config => config.id !== parseInt(paymentConfigId));
        }
        return cachedConfigs;
      });
      
      return { paymentConfigId, message: response.data.message };
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to delete payment configuration';
      return rejectWithValue(message);
    }
  }
);

// Toggle Payment Configuration Status
export const togglePaymentConfigThunk = createAsyncThunk(
  'paymentConfig/togglePaymentConfig',
  async (paymentConfigId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(API_ENDPOINTS.PAYMENT_CONFIG.TOGGLE(paymentConfigId));
      const updatedPaymentConfig = response.data.data;
      
      // Update cache
      dataCache.set('paymentConfig', updatedPaymentConfig, { paymentConfigId });
      
      // Also update the payment config in the payment configs list cache
      dataCache.optimisticUpdate('paymentConfigs', (cachedConfigs) => {
        if (Array.isArray(cachedConfigs)) {
          return cachedConfigs.map(config => 
            config.id === parseInt(paymentConfigId) ? { ...config, ...updatedPaymentConfig } : config
          );
        }
        return cachedConfigs;
      });
      
      return updatedPaymentConfig;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to toggle payment configuration status';
      return rejectWithValue(message);
    }
  }
);

// Get Active Payment Configurations
export const fetchActivePaymentConfigsThunk = createAsyncThunk(
  'paymentConfig/fetchActivePaymentConfigs',
  async ({ type = '', forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = { type, active: true };
      
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('activePaymentConfigs', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }
      
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      
      const response = await axiosInstance.get(`${API_ENDPOINTS.PAYMENT_CONFIG.ACTIVE}?${params}`);
      const data = response.data.data;
      
      // Update cache with new data
      dataCache.set('activePaymentConfigs', data, cacheKey);
      
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch active payment configurations';
      return rejectWithValue(message);
    }
  }
);