import { createSlice } from '@reduxjs/toolkit';
import {
  fetchPaymentsThunk,
  fetchPaymentByIdThunk,
  fetchUserPaymentsThunk,
  deletePaymentThunk,
  refundPaymentThunk,
  searchPaymentsThunk
} from './paymentThunks';

const initialState = {
  payments: [],
  userPayments: [],
  currentPayment: null,
  loading: false,
  error: null,
  validationErrors: {},
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  },
  stats: {
    total: 0,
    success: 0,
    failed: 0,
    pending: 0,
    refunded: 0,
    created: 0
  },
  filters: {
    search: '',
    status: '',
    type: '',
    mobileNumber: '',
    page: 1,
    limit: 10
  }
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.validationErrors = {};
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    setCurrentPayment: (state, action) => {
      state.currentPayment = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        status: '',
        type: '',
        mobileNumber: '',
        page: 1,
        limit: 10
      };
    },
    updateStats: (state) => {
      const payments = state.payments;
      const statusCounts = {
        success: 0,
        failed: 0,
        pending: 0,
        refunded: 0,
        created: 0
      };

      payments.forEach(payment => {
        const status = payment.status?.toLowerCase();
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status] += 1;
        }
      });

      state.stats = {
        total: payments.length,
        ...statusCounts
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Payments
      .addCase(fetchPaymentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.payments || action.payload;
        
        // Handle pagination if present
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        
        paymentSlice.caseReducers.updateStats(state);
      })
      .addCase(fetchPaymentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Payment by ID
      .addCase(fetchPaymentByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(fetchPaymentByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User Payments
      .addCase(fetchUserPaymentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPaymentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.userPayments = action.payload.payments || action.payload;
        
        // Handle pagination if present
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchUserPaymentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Payment
      .addCase(deletePaymentThunk.pending, (state) => {
        // Don't set loading to true to prevent full UI refresh
        state.error = null;
      })
      .addCase(deletePaymentThunk.fulfilled, (state, action) => {
        // Remove from payments list
        state.payments = state.payments.filter(payment => payment.id !== action.payload.paymentId);
        
        // Remove from user payments list
        state.userPayments = state.userPayments.filter(payment => payment.id !== action.payload.paymentId);
        
        // Clear current payment if it was the deleted one
        if (state.currentPayment?.id === action.payload.paymentId) {
          state.currentPayment = null;
        }

        // Update stats
        paymentSlice.caseReducers.updateStats(state);
      })
      .addCase(deletePaymentThunk.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Refund Payment
      .addCase(refundPaymentThunk.pending, (state) => {
        // Don't set loading to true to prevent full UI refresh
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(refundPaymentThunk.fulfilled, (state, action) => {
        // Update payment in payments list
        const paymentsIndex = state.payments.findIndex(payment => payment.id === action.payload.id);
        if (paymentsIndex !== -1) {
          state.payments[paymentsIndex] = action.payload;
        }

        // Update payment in user payments list
        const userPaymentsIndex = state.userPayments.findIndex(payment => payment.id === action.payload.id);
        if (userPaymentsIndex !== -1) {
          state.userPayments[userPaymentsIndex] = action.payload;
        }
        
        // Update current payment if it's the same one
        if (state.currentPayment?.id === action.payload.id) {
          state.currentPayment = action.payload;
        }

        // Update stats
        paymentSlice.caseReducers.updateStats(state);
      })
      .addCase(refundPaymentThunk.rejected, (state, action) => {
        state.error = action.payload?.message || action.payload;
        state.validationErrors = action.payload?.validationErrors || {};
      })
      
      // Search Payments
      .addCase(searchPaymentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPaymentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.payments || action.payload;
        
        // Handle pagination if present
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        
        // Update stats for search results
        paymentSlice.caseReducers.updateStats(state);
      })
      .addCase(searchPaymentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearCurrentPayment,
  setCurrentPayment,
  setFilters,
  resetFilters,
  updateStats
} = paymentSlice.actions;

export default paymentSlice.reducer;