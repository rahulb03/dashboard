import { createSlice } from '@reduxjs/toolkit';
import {
  createPaymentConfigThunk,
  fetchPaymentConfigsThunk,
  fetchPaymentConfigByIdThunk,
  updatePaymentConfigThunk,
  deletePaymentConfigThunk,
  togglePaymentConfigThunk,
  fetchActivePaymentConfigsThunk
} from './paymentConfigThunks';

const initialState = {
  paymentConfigs: [],
  activePaymentConfigs: [],
  currentPaymentConfig: null,
  loading: false,
  error: null,
  validationErrors: {},
  stats: {
    total: 0,
    active: 0,
    inactive: 0,
    loanFee: 0,
    membership: 0,
    documentFee: 0
  },
  filters: {
    type: '',
    isActive: '',
  }
};

const paymentConfigSlice = createSlice({
  name: 'paymentConfig',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.validationErrors = {};
    },
    clearCurrentPaymentConfig: (state) => {
      state.currentPaymentConfig = null;
    },
    setCurrentPaymentConfig: (state, action) => {
      state.currentPaymentConfig = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        type: '',
        isActive: ''
      };
    },
    updateStats: (state) => {
      const configs = state.paymentConfigs;
      state.stats = {
        total: configs.length,
        active: configs.filter(config => config.isActive === true).length,
        inactive: configs.filter(config => config.isActive === false).length,
        loanFee: configs.filter(config => config.type === 'LOAN_FEE').length,
        membership: configs.filter(config => config.type === 'MEMBERSHIP').length,
        documentFee: configs.filter(config => config.type === 'DOCUMENT_FEE').length
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Payment Configuration
      .addCase(createPaymentConfigThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createPaymentConfigThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentConfigs.unshift(action.payload);
        // Update stats
        state.stats.total += 1;
        if (action.payload.isActive) {
          state.stats.active += 1;
        } else {
          state.stats.inactive += 1;
        }
        const typeKey = action.payload.type?.toLowerCase().replace('_', '');
        if (typeKey === 'loanfee') state.stats.loanFee += 1;
        else if (typeKey === 'membership') state.stats.membership += 1;
        else if (typeKey === 'documentfee') state.stats.documentFee += 1;
      })
      .addCase(createPaymentConfigThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload;
        state.validationErrors = action.payload?.validationErrors || {};
      })
      
      // Fetch All Payment Configurations
      .addCase(fetchPaymentConfigsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentConfigsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentConfigs = action.payload || [];
        paymentConfigSlice.caseReducers.updateStats(state);
      })
      .addCase(fetchPaymentConfigsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Payment Configuration by ID
      .addCase(fetchPaymentConfigByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentConfigByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPaymentConfig = action.payload;
      })
      .addCase(fetchPaymentConfigByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Payment Configuration
      .addCase(updatePaymentConfigThunk.pending, (state) => {
        // Don't set loading to true to prevent full UI refresh
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updatePaymentConfigThunk.fulfilled, (state, action) => {
        const index = state.paymentConfigs.findIndex(config => config.id === action.payload.id);
        if (index !== -1) {
          const oldConfig = state.paymentConfigs[index];
          // Update stats only if isActive status changed
          if (oldConfig.isActive !== action.payload.isActive) {
            if (oldConfig.isActive) {
              state.stats.active -= 1;
              state.stats.inactive += 1;
            } else {
              state.stats.active += 1;
              state.stats.inactive -= 1;
            }
          }
          // Create new array to ensure React detects the change
          state.paymentConfigs = [
            ...state.paymentConfigs.slice(0, index),
            action.payload,
            ...state.paymentConfigs.slice(index + 1)
          ];
        }
        if (state.currentPaymentConfig?.id === action.payload.id) {
          state.currentPaymentConfig = action.payload;
        }
      })
      .addCase(updatePaymentConfigThunk.rejected, (state, action) => {
        state.error = action.payload?.message || action.payload;
        state.validationErrors = action.payload?.validationErrors || {};
      })
      
      // Delete Payment Configuration
      .addCase(deletePaymentConfigThunk.pending, (state) => {
        // Don't set loading to true to prevent full UI refresh
        state.error = null;
      })
      .addCase(deletePaymentConfigThunk.fulfilled, (state, action) => {
        const configToDelete = state.paymentConfigs.find(config => config.id === parseInt(action.payload.paymentConfigId));
        if (configToDelete) {
          // Update stats
          state.stats.total = Math.max(0, state.stats.total - 1);
          if (configToDelete.isActive) {
            state.stats.active = Math.max(0, state.stats.active - 1);
          } else {
            state.stats.inactive = Math.max(0, state.stats.inactive - 1);
          }
          const typeKey = configToDelete.type?.toLowerCase().replace('_', '');
          if (typeKey === 'loanfee') state.stats.loanFee = Math.max(0, state.stats.loanFee - 1);
          else if (typeKey === 'membership') state.stats.membership = Math.max(0, state.stats.membership - 1);
          else if (typeKey === 'documentfee') state.stats.documentFee = Math.max(0, state.stats.documentFee - 1);
        }
        
        state.paymentConfigs = state.paymentConfigs.filter(config => config.id !== parseInt(action.payload.paymentConfigId));
        if (state.currentPaymentConfig?.id === parseInt(action.payload.paymentConfigId)) {
          state.currentPaymentConfig = null;
        }
      })
      .addCase(deletePaymentConfigThunk.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Toggle Payment Configuration Status
      .addCase(togglePaymentConfigThunk.pending, (state) => {
        // Don't set loading to true to prevent full UI refresh
        state.error = null;
      })
      .addCase(togglePaymentConfigThunk.fulfilled, (state, action) => {
        const index = state.paymentConfigs.findIndex(config => config.id === action.payload.id);
        if (index !== -1) {
          const oldConfig = state.paymentConfigs[index];
          // Update stats based on status change
          if (oldConfig.isActive !== action.payload.isActive) {
            if (action.payload.isActive) {
              state.stats.active += 1;
              state.stats.inactive = Math.max(0, state.stats.inactive - 1);
            } else {
              state.stats.active = Math.max(0, state.stats.active - 1);
              state.stats.inactive += 1;
            }
          }
          // Create new array to ensure React detects the change
          const updatedConfig = { ...oldConfig, ...action.payload };
          state.paymentConfigs = [
            ...state.paymentConfigs.slice(0, index),
            updatedConfig,
            ...state.paymentConfigs.slice(index + 1)
          ];
        }
        if (state.currentPaymentConfig?.id === action.payload.id) {
          state.currentPaymentConfig = { ...state.currentPaymentConfig, ...action.payload };
        }
      })
      .addCase(togglePaymentConfigThunk.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Fetch Active Payment Configurations
      .addCase(fetchActivePaymentConfigsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivePaymentConfigsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.activePaymentConfigs = action.payload || [];
      })
      .addCase(fetchActivePaymentConfigsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearCurrentPaymentConfig,
  setCurrentPaymentConfig,
  setFilters,
  resetFilters,
  updateStats
} = paymentConfigSlice.actions;

export default paymentConfigSlice.reducer;