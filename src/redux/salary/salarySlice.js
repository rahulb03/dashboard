import { createSlice } from '@reduxjs/toolkit';
import {
  createSalaryThunk,
  fetchSalariesThunk,
  fetchSalaryByIdThunk,
  updateSalaryThunk,
  deleteSalaryThunk,
  fetchSalariesByEmploymentTypeThunk,
  searchSalariesThunk,
  bulkDeleteSalariesThunk
} from './salaryThunks';

const initialState = {
  // Current salaries list
  salaries: [],
  currentSalary: null,
  filteredSalaries: [],
  
  // Loading states
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isFetching: false,
  
  // Error states
  error: null,
  validationErrors: {},
  
  // UI states
  searchQuery: '',
  currentEmploymentType: 'all',
  selectedSalaryIds: [],
  
  // Pagination and filtering
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  
  // Last fetch timestamp for cache management
  lastFetch: null,
  
  // Success messages
  successMessage: null
};

const salarySlice = createSlice({
  name: 'salary',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.validationErrors = {};
    },
    
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    
    clearCurrentSalary: (state) => {
      state.currentSalary = null;
    },
    
    clearValidationErrors: (state) => {
      state.validationErrors = {};
    },
    
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    
    setCurrentEmploymentType: (state, action) => {
      state.currentEmploymentType = action.payload;
    },
    
    setSelectedSalaryIds: (state, action) => {
      state.selectedSalaryIds = action.payload;
    },
    
    toggleSalarySelection: (state, action) => {
      const salaryId = action.payload;
      if (state.selectedSalaryIds.includes(salaryId)) {
        state.selectedSalaryIds = state.selectedSalaryIds.filter(id => id !== salaryId);
      } else {
        state.selectedSalaryIds.push(salaryId);
      }
    },
    
    selectAllSalaries: (state) => {
      state.selectedSalaryIds = state.salaries.map(salary => salary.id);
    },
    
    deselectAllSalaries: (state) => {
      state.selectedSalaryIds = [];
    },
    
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    resetSalaryState: () => initialState
  },
  
  extraReducers: (builder) => {
    builder
      // Create Salary Cases
      .addCase(createSalaryThunk.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createSalaryThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.salaries.unshift(action.payload);
        state.successMessage = 'Salary configuration created successfully';
        state.pagination.totalItems += 1;
        state.lastFetch = Date.now();
      })
      .addCase(createSalaryThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload?.message || action.payload || 'Failed to create salary configuration';
        state.validationErrors = action.payload?.validationErrors || {};
      })
      
      // Fetch All Salaries Cases
      .addCase(fetchSalariesThunk.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchSalariesThunk.fulfilled, (state, action) => {
        state.isFetching = false;
        state.salaries = action.payload || [];
        state.pagination.totalItems = action.payload?.length || 0;
        state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.itemsPerPage);
        state.lastFetch = Date.now();
      })
      .addCase(fetchSalariesThunk.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload || 'Failed to fetch salary configurations';
        state.salaries = [];
      })
      
      // Fetch Single Salary Cases
      .addCase(fetchSalaryByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.currentSalary = null;
      })
      .addCase(fetchSalaryByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSalary = action.payload;
      })
      .addCase(fetchSalaryByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch salary configuration';
        state.currentSalary = null;
      })
      
      // Update Salary Cases
      .addCase(updateSalaryThunk.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updateSalaryThunk.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedSalary = action.payload;
        
        // Update in salaries list - create new array to ensure React detects the change
        const index = state.salaries.findIndex(salary => salary.id === updatedSalary.id);
        if (index !== -1) {
          state.salaries = [
            ...state.salaries.slice(0, index),
            updatedSalary,
            ...state.salaries.slice(index + 1)
          ];
        }
        
        // Update current salary if it matches
        if (state.currentSalary && state.currentSalary.id === updatedSalary.id) {
          state.currentSalary = updatedSalary;
        }
        
        state.successMessage = 'Salary configuration updated successfully';
      })
      .addCase(updateSalaryThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload?.message || action.payload || 'Failed to update salary configuration';
        state.validationErrors = action.payload?.validationErrors || {};
      })
      
      // Delete Salary Cases
      .addCase(deleteSalaryThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteSalaryThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        const { salaryId } = action.payload;
        
        // Remove from salaries list
        state.salaries = state.salaries.filter(salary => salary.id !== parseInt(salaryId));
        
        // Remove from selected if present
        state.selectedSalaryIds = state.selectedSalaryIds.filter(id => id !== parseInt(salaryId));
        
        // Clear current salary if it was deleted
        if (state.currentSalary && state.currentSalary.id === parseInt(salaryId)) {
          state.currentSalary = null;
        }
        
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
        state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.itemsPerPage);
        state.successMessage = action.payload.message || 'Salary configuration deleted successfully';
      })
      .addCase(deleteSalaryThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload || 'Failed to delete salary configuration';
      })
      
      // Fetch Salaries by Employment Type Cases
      .addCase(fetchSalariesByEmploymentTypeThunk.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchSalariesByEmploymentTypeThunk.fulfilled, (state, action) => {
        state.isFetching = false;
        const { employmentType, salaries } = action.payload;
        state.currentEmploymentType = employmentType;
        state.filteredSalaries = salaries || [];
      })
      .addCase(fetchSalariesByEmploymentTypeThunk.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload || 'Failed to fetch salaries by employment type';
        state.filteredSalaries = [];
      })
      
      // Search Salaries Cases
      .addCase(searchSalariesThunk.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(searchSalariesThunk.fulfilled, (state, action) => {
        state.isFetching = false;
        state.filteredSalaries = action.payload || [];
        state.pagination.totalItems = action.payload?.length || 0;
        state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.itemsPerPage);
      })
      .addCase(searchSalariesThunk.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload || 'Failed to search salaries';
        state.filteredSalaries = [];
      })
      
      // Bulk Delete Salaries Cases
      .addCase(bulkDeleteSalariesThunk.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(bulkDeleteSalariesThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        const { successful, failed } = action.payload;
        
        // Remove successfully deleted salaries from state
        if (successful.length > 0) {
          state.salaries = state.salaries.filter(salary => !successful.includes(salary.id));
          state.selectedSalaryIds = state.selectedSalaryIds.filter(id => !successful.includes(id));
          
          // Update pagination
          state.pagination.totalItems = Math.max(0, state.pagination.totalItems - successful.length);
          state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.itemsPerPage);
        }
        
        // Handle success and error messaging
        if (successful.length > 0 && failed.length === 0) {
          state.successMessage = `Successfully deleted ${successful.length} salary configuration(s)`;
        } else if (successful.length > 0 && failed.length > 0) {
          state.successMessage = `Successfully deleted ${successful.length} salary configuration(s), ${failed.length} failed`;
          state.error = `Failed to delete ${failed.length} salary configuration(s)`;
        } else if (failed.length > 0) {
          state.error = `Failed to delete ${failed.length} salary configuration(s)`;
        }
      })
      .addCase(bulkDeleteSalariesThunk.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload || 'Bulk delete operation failed';
      });
  }
});

export const {
  clearError,
  clearSuccessMessage,
  clearCurrentSalary,
  clearValidationErrors,
  setSearchQuery,
  setCurrentEmploymentType,
  setSelectedSalaryIds,
  toggleSalarySelection,
  selectAllSalaries,
  deselectAllSalaries,
  setPagination,
  resetSalaryState
} = salarySlice.actions;

export default salarySlice.reducer;

// Selectors
export const selectSalaries = (state) => state.salary.salaries;
export const selectCurrentSalary = (state) => state.salary.currentSalary;
export const selectFilteredSalaries = (state) => state.salary.filteredSalaries;
export const selectSalaryLoading = (state) => state.salary.isLoading;
export const selectSalaryCreating = (state) => state.salary.isCreating;
export const selectSalaryUpdating = (state) => state.salary.isUpdating;
export const selectSalaryDeleting = (state) => state.salary.isDeleting;
export const selectSalaryFetching = (state) => state.salary.isFetching;
export const selectSalaryError = (state) => state.salary.error;
export const selectSalaryValidationErrors = (state) => state.salary.validationErrors;
export const selectSalarySuccessMessage = (state) => state.salary.successMessage;
export const selectSelectedSalaryIds = (state) => state.salary.selectedSalaryIds;
export const selectSearchQuery = (state) => state.salary.searchQuery;
export const selectCurrentEmploymentType = (state) => state.salary.currentEmploymentType;
export const selectSalaryPagination = (state) => state.salary.pagination;