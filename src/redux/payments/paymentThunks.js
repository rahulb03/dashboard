import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constant';
import dataCache from '@/utils/DataCacheManager';

// Get All Payments with pagination and filtering
export const fetchPaymentsThunk = createAsyncThunk(
  'payments/fetchPayments',
  async (
    { 
      page = 1, 
      status = '',
      type = '',
      mobileNumber = '',
      forceRefresh = false 
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const cacheKey = { 
        page, 
        status,
        type,
        mobileNumber
      };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('payments', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({
        page: page.toString(),
        ...(status && { status }),
        ...(type && { type }),
        ...(mobileNumber && { mobileNumber })
      });

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.PAYMENTS.LIST}?${params}`
      );
      const data = response.data.data;

      // Update cache with new data
      dataCache.set('payments', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch payments';
      return rejectWithValue(message);
    }
  }
);

// Get Payment by ID
export const fetchPaymentByIdThunk = createAsyncThunk(
  'payments/fetchPaymentById',
  async ({ paymentId, forceRefresh = false }, { rejectWithValue }) => {
    try {
      const cacheKey = { paymentId };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('payment', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const response = await axiosInstance.get(
        API_ENDPOINTS.PAYMENTS.GET_ONE(paymentId)
      );
      const data = response.data.data;

      // Update cache with new data
      dataCache.set('payment', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch payment';
      return rejectWithValue(message);
    }
  }
);

// Get User's Payment History
export const fetchUserPaymentsThunk = createAsyncThunk(
  'payments/fetchUserPayments',
  async (
    { 
      page = 1, 
      status = '',
      type = '',
      forceRefresh = false 
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const cacheKey = { 
        type: 'user-payments',
        page, 
        status,
        type
      };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('userPayments', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({
        page: page.toString(),
        ...(status && { status }),
        ...(type && { type })
      });

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.PAYMENTS.USER_HISTORY}?${params}`
      );
      const data = response.data.data;

      // Update cache with new data
      dataCache.set('userPayments', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch user payments';
      return rejectWithValue(message);
    }
  }
);

// Delete Payment (Only for failed/created payments)
export const deletePaymentThunk = createAsyncThunk(
  'payments/deletePayment',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        API_ENDPOINTS.PAYMENTS.DELETE(paymentId)
      );

      // Remove from individual payment cache
      dataCache.invalidate('payment', { paymentId });

      // Remove from payments list cache with optimistic update
      dataCache.optimisticUpdate('payments', (cachedPayments) => {
        if (Array.isArray(cachedPayments.data?.payments)) {
          return {
            ...cachedPayments,
            data: {
              ...cachedPayments.data,
              payments: cachedPayments.data.payments.filter(
                (payment) => payment.id !== paymentId
              )
            }
          };
        }
        return cachedPayments;
      });

      // Also update user payments cache
      dataCache.optimisticUpdate('userPayments', (cachedUserPayments) => {
        if (Array.isArray(cachedUserPayments.data?.payments)) {
          return {
            ...cachedUserPayments,
            data: {
              ...cachedUserPayments.data,
              payments: cachedUserPayments.data.payments.filter(
                (payment) => payment.id !== paymentId
              )
            }
          };
        }
        return cachedUserPayments;
      });

      return { paymentId, message: response.data.message };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to delete payment';
      return rejectWithValue(message);
    }
  }
);

// Refund Payment
export const refundPaymentThunk = createAsyncThunk(
  'payments/refundPayment',
  async ({ paymentId, amount, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.PAYMENTS.REFUND(paymentId),
        { amount, reason }
      );
      const refundedPayment = response.data.data;

      // Update payment in cache
      dataCache.set('payment', refundedPayment, { paymentId });

      // Update payments list cache
      dataCache.optimisticUpdate('payments', (cachedPayments) => {
        if (Array.isArray(cachedPayments.data?.payments)) {
          return {
            ...cachedPayments,
            data: {
              ...cachedPayments.data,
              payments: cachedPayments.data.payments.map((payment) =>
                payment.id === paymentId
                  ? { ...payment, ...refundedPayment }
                  : payment
              )
            }
          };
        }
        return cachedPayments;
      });

      // Update user payments cache
      dataCache.optimisticUpdate('userPayments', (cachedUserPayments) => {
        if (Array.isArray(cachedUserPayments.data?.payments)) {
          return {
            ...cachedUserPayments,
            data: {
              ...cachedUserPayments.data,
              payments: cachedUserPayments.data.payments.map((payment) =>
                payment.id === paymentId
                  ? { ...payment, ...refundedPayment }
                  : payment
              )
            }
          };
        }
        return cachedUserPayments;
      });

      return refundedPayment;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to refund payment';
      return rejectWithValue(message);
    }
  }
);

// Create Payment
export const createPaymentThunk = createAsyncThunk(
  'payments/createPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.PAYMENTS.LIST, // Using LIST endpoint for create
        paymentData
      );
      const newPayment = response.data.data;

      // Add to individual payment cache
      dataCache.set('payment', newPayment, {
        paymentId: newPayment.id
      });

      // Add to payments list cache with optimistic update
      dataCache.optimisticUpdate('payments', (cachedPayments) => {
        if (Array.isArray(cachedPayments?.data?.payments)) {
          return {
            ...cachedPayments,
            data: {
              ...cachedPayments.data,
              payments: [newPayment, ...cachedPayments.data.payments]
            }
          };
        } else if (Array.isArray(cachedPayments)) {
          return [newPayment, ...cachedPayments];
        }
        return cachedPayments;
      });

      // Also update user payments cache
      dataCache.optimisticUpdate('userPayments', (cachedUserPayments) => {
        if (Array.isArray(cachedUserPayments?.data?.payments)) {
          return {
            ...cachedUserPayments,
            data: {
              ...cachedUserPayments.data,
              payments: [newPayment, ...cachedUserPayments.data.payments]
            }
          };
        } else if (Array.isArray(cachedUserPayments)) {
          return [newPayment, ...cachedUserPayments];
        }
        return cachedUserPayments;
      });

      return newPayment;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to create payment';
      const validationErrors = error?.response?.data?.data || {};
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Update Payment
export const updatePaymentThunk = createAsyncThunk(
  'payments/updatePayment',
  async ({ paymentId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.PAYMENTS.GET_ONE(paymentId), // Using GET_ONE endpoint for update
        paymentData
      );
      const updatedPayment = response.data.data;

      // Update payment in cache
      dataCache.set('payment', updatedPayment, { paymentId });

      // Update payments list cache
      dataCache.optimisticUpdate('payments', (cachedPayments) => {
        if (Array.isArray(cachedPayments?.data?.payments)) {
          return {
            ...cachedPayments,
            data: {
              ...cachedPayments.data,
              payments: cachedPayments.data.payments.map((payment) =>
                payment.id === paymentId
                  ? { ...payment, ...updatedPayment }
                  : payment
              )
            }
          };
        } else if (Array.isArray(cachedPayments)) {
          return cachedPayments.map((payment) =>
            payment.id === paymentId
              ? { ...payment, ...updatedPayment }
              : payment
          );
        }
        return cachedPayments;
      });

      // Update user payments cache
      dataCache.optimisticUpdate('userPayments', (cachedUserPayments) => {
        if (Array.isArray(cachedUserPayments?.data?.payments)) {
          return {
            ...cachedUserPayments,
            data: {
              ...cachedUserPayments.data,
              payments: cachedUserPayments.data.payments.map((payment) =>
                payment.id === paymentId
                  ? { ...payment, ...updatedPayment }
                  : payment
              )
            }
          };
        } else if (Array.isArray(cachedUserPayments)) {
          return cachedUserPayments.map((payment) =>
            payment.id === paymentId
              ? { ...payment, ...updatedPayment }
              : payment
          );
        }
        return cachedUserPayments;
      });

      return updatedPayment;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to update payment';
      const validationErrors = error?.response?.data?.data || {};
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Update Payment Status
export const updatePaymentStatusThunk = createAsyncThunk(
  'payments/updatePaymentStatus',
  async ({ paymentId, status, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.PAYMENTS.GET_ONE(paymentId)}/status`,
        { status, reason }
      );
      const updatedPayment = response.data.data;

      // Update payment in cache
      dataCache.set('payment', updatedPayment, { paymentId });

      // Update payments list cache
      dataCache.optimisticUpdate('payments', (cachedPayments) => {
        if (Array.isArray(cachedPayments?.data?.payments)) {
          return {
            ...cachedPayments,
            data: {
              ...cachedPayments.data,
              payments: cachedPayments.data.payments.map((payment) =>
                payment.id === paymentId
                  ? { ...payment, ...updatedPayment }
                  : payment
              )
            }
          };
        } else if (Array.isArray(cachedPayments)) {
          return cachedPayments.map((payment) =>
            payment.id === paymentId
              ? { ...payment, ...updatedPayment }
              : payment
          );
        }
        return cachedPayments;
      });

      // Update user payments cache
      dataCache.optimisticUpdate('userPayments', (cachedUserPayments) => {
        if (Array.isArray(cachedUserPayments?.data?.payments)) {
          return {
            ...cachedUserPayments,
            data: {
              ...cachedUserPayments.data,
              payments: cachedUserPayments.data.payments.map((payment) =>
                payment.id === paymentId
                  ? { ...payment, ...updatedPayment }
                  : payment
              )
            }
          };
        } else if (Array.isArray(cachedUserPayments)) {
          return cachedUserPayments.map((payment) =>
            payment.id === paymentId
              ? { ...payment, ...updatedPayment }
              : payment
          );
        }
        return cachedUserPayments;
      });

      return updatedPayment;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to update payment status';
      return rejectWithValue(message);
    }
  }
);

// Search Payments with caching
export const searchPaymentsThunk = createAsyncThunk(
  'payments/searchPayments',
  async ({ query, page = 1, status = '', type = '', forceRefresh = false }, { rejectWithValue }) => {
    try {
      const cacheKey = { 
        query,
        page, 
        status,
        type
      };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('searchPayments', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({
        mobileNumber: query, // Search by mobile number primarily
        page: page.toString(),
        ...(status && { status }),
        ...(type && { type })
      });

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.PAYMENTS.LIST}?${params}`
      );
      const data = response.data.data;

      // Update cache with new data
      dataCache.set('searchPayments', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to search payments';
      return rejectWithValue(message);
    }
  }
);
