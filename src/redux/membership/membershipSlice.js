import { createSlice } from '@reduxjs/toolkit';
import {
  createMembershipThunk,
  fetchMembershipsThunk,
  fetchMembershipByIdThunk,
  fetchUserMembershipThunk,
  updateMembershipThunk,
  deleteMembershipThunk,
  bulkUpdateMembershipsThunk,
  extendMembershipThunk,
  fetchMembershipStatsThunk,
  updateExpiredMembershipsThunk,
  searchMembershipsThunk
} from './membershipThunks';

const initialState = {
  memberships: [],
  currentMembership: null,
  userMembership: null,
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
    overview: {
      total: 0,
      active: 0,
      expired: 0,
      cancelled: 0,
      suspended: 0
    },
    statusDistribution: {
      active: 0,
      expired: 0,
      cancelled: 0,
      suspended: 0
    },
    recentMemberships: [],
    expiringMemberships: []
  },
  filters: {
    search: '',
    status: '',
    isActive: null,
    startDateFrom: '',
    startDateTo: '',
    endDateFrom: '',
    endDateTo: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
};

const membershipSlice = createSlice({
  name: 'membership',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.validationErrors = {};
    },
    clearCurrentMembership: (state) => {
      state.currentMembership = null;
    },
    setCurrentMembership: (state, action) => {
      state.currentMembership = action.payload;
    },
    clearUserMembership: (state) => {
      state.userMembership = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        status: '',
        isActive: null,
        startDateFrom: '',
        startDateTo: '',
        endDateFrom: '',
        endDateTo: '',
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
    },
    updateStats: (state) => {
      const memberships = state.memberships;
      const statusCounts = {
        active: 0,
        expired: 0,
        cancelled: 0,
        suspended: 0
      };

      memberships.forEach(membership => {
        const status = membership.status?.toLowerCase();
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status] += 1;
        }
      });

      state.stats.overview = {
        total: memberships.length,
        ...statusCounts
      };
      state.stats.statusDistribution = statusCounts;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Membership
      .addCase(createMembershipThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createMembershipThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.memberships.unshift(action.payload);
        
        // Update stats optimistically
        state.stats.overview.total += 1;
        const status = action.payload.status?.toLowerCase();
        if (state.stats.overview[status] !== undefined) {
          state.stats.overview[status] += 1;
          state.stats.statusDistribution[status] += 1;
        }
      })
      .addCase(createMembershipThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload;
        state.validationErrors = action.payload?.validationErrors || {};
      })
      
      // Fetch All Memberships
      .addCase(fetchMembershipsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembershipsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.memberships = action.payload.memberships || action.payload;
        
        // Handle pagination if present
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        
        membershipSlice.caseReducers.updateStats(state);
      })
      .addCase(fetchMembershipsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Membership by ID
      .addCase(fetchMembershipByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembershipByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMembership = action.payload;
      })
      .addCase(fetchMembershipByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User Membership
      .addCase(fetchUserMembershipThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserMembershipThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.userMembership = action.payload;
      })
      .addCase(fetchUserMembershipThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Membership
      .addCase(updateMembershipThunk.pending, (state) => {
        // Don't set loading to true to prevent full UI refresh
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updateMembershipThunk.fulfilled, (state, action) => {
        const index = state.memberships.findIndex(membership => membership.id === action.payload.id);
        if (index !== -1) {
          const oldMembership = state.memberships[index];
          // Update stats only if status changed
          if (oldMembership.status !== action.payload.status) {
            // Decrement old status count
            const oldStatus = oldMembership.status?.toLowerCase();
            if (oldStatus && state.stats.overview[oldStatus] !== undefined) {
              state.stats.overview[oldStatus] = Math.max(0, state.stats.overview[oldStatus] - 1);
              state.stats.statusDistribution[oldStatus] = Math.max(0, state.stats.statusDistribution[oldStatus] - 1);
            }
            // Increment new status count
            const newStatus = action.payload.status?.toLowerCase();
            if (newStatus && state.stats.overview[newStatus] !== undefined) {
              state.stats.overview[newStatus] += 1;
              state.stats.statusDistribution[newStatus] += 1;
            }
          }
          // Create new array to ensure React detects the change
          state.memberships = [
            ...state.memberships.slice(0, index),
            action.payload,
            ...state.memberships.slice(index + 1)
          ];
        }
        if (state.currentMembership?.id === action.payload.id) {
          state.currentMembership = action.payload;
        }
        if (state.userMembership?.id === action.payload.id) {
          state.userMembership = action.payload;
        }
      })
      .addCase(updateMembershipThunk.rejected, (state, action) => {
        state.error = action.payload?.message || action.payload;
        state.validationErrors = action.payload?.validationErrors || {};
      })
      
      // Delete Membership (Cancel)
      .addCase(deleteMembershipThunk.pending, (state) => {
        // Don't set loading to true to prevent full UI refresh
        state.error = null;
      })
      .addCase(deleteMembershipThunk.fulfilled, (state, action) => {
        const membershipToCancel = state.memberships.find(
          membership => membership.id === parseInt(action.payload.membershipId)
        );
        
        if (membershipToCancel) {
          // Update the membership status to CANCELLED
          const index = state.memberships.findIndex(
            membership => membership.id === parseInt(action.payload.membershipId)
          );
          if (index !== -1) {
            // Update stats - move from current status to cancelled
            const oldStatus = membershipToCancel.status?.toLowerCase();
            if (oldStatus && state.stats.overview[oldStatus] !== undefined) {
              state.stats.overview[oldStatus] = Math.max(0, state.stats.overview[oldStatus] - 1);
              state.stats.statusDistribution[oldStatus] = Math.max(0, state.stats.statusDistribution[oldStatus] - 1);
            }
            
            // Update to cancelled - create new array to ensure React detects the change
            const cancelledMembership = {
              ...membershipToCancel,
              status: 'CANCELLED',
              isActive: false
            };
            state.memberships = [
              ...state.memberships.slice(0, index),
              cancelledMembership,
              ...state.memberships.slice(index + 1)
            ];
            
            state.stats.overview.cancelled += 1;
            state.stats.statusDistribution.cancelled += 1;
          }
        }
        
        if (state.currentMembership?.id === parseInt(action.payload.membershipId)) {
          state.currentMembership = null;
        }
      })
      .addCase(deleteMembershipThunk.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Bulk Update Memberships
      .addCase(bulkUpdateMembershipsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(bulkUpdateMembershipsThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Since this is a bulk operation, we'll need to refresh the data
        // The cache invalidation in the thunk will handle this
      })
      .addCase(bulkUpdateMembershipsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload;
        state.validationErrors = action.payload?.validationErrors || {};
      })

      // Extend Membership
      .addCase(extendMembershipThunk.pending, (state) => {
        // Don't set loading to true to prevent full UI refresh
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(extendMembershipThunk.fulfilled, (state, action) => {
        const index = state.memberships.findIndex(
          membership => membership.userId === action.payload.userId
        );
        if (index !== -1) {
          const oldMembership = state.memberships[index];
          // Update stats only if status changed (likely EXPIRED -> ACTIVE)
          if (oldMembership.status !== action.payload.status) {
            // Decrement old status count
            const oldStatus = oldMembership.status?.toLowerCase();
            if (oldStatus && state.stats.overview[oldStatus] !== undefined) {
              state.stats.overview[oldStatus] = Math.max(0, state.stats.overview[oldStatus] - 1);
              state.stats.statusDistribution[oldStatus] = Math.max(0, state.stats.statusDistribution[oldStatus] - 1);
            }
            // Increment new status count
            const newStatus = action.payload.status?.toLowerCase();
            if (newStatus && state.stats.overview[newStatus] !== undefined) {
              state.stats.overview[newStatus] += 1;
              state.stats.statusDistribution[newStatus] += 1;
            }
          }
          // Create new array to ensure React detects the change
          state.memberships = [
            ...state.memberships.slice(0, index),
            action.payload,
            ...state.memberships.slice(index + 1)
          ];
        }
        if (state.currentMembership?.userId === action.payload.userId) {
          state.currentMembership = action.payload;
        }
        if (state.userMembership?.userId === action.payload.userId) {
          state.userMembership = action.payload;
        }
      })
      .addCase(extendMembershipThunk.rejected, (state, action) => {
        state.error = action.payload?.message || action.payload;
        state.validationErrors = action.payload?.validationErrors || {};
      })

      // Fetch Membership Statistics
      .addCase(fetchMembershipStatsThunk.pending, (state) => {
        // Don't set loading to true for stats to prevent UI disruption
        state.error = null;
      })
      .addCase(fetchMembershipStatsThunk.fulfilled, (state, action) => {
        state.stats = {
          ...state.stats,
          ...action.payload
        };
      })
      .addCase(fetchMembershipStatsThunk.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update Expired Memberships
      .addCase(updateExpiredMembershipsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpiredMembershipsThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Since this updates multiple memberships, we'll need to refresh the data
        // The cache invalidation in the thunk will handle this
      })
      .addCase(updateExpiredMembershipsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search Memberships
      .addCase(searchMembershipsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMembershipsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.memberships = action.payload.memberships || action.payload;
        
        // Handle pagination if present
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        
        // Update stats for search results
        membershipSlice.caseReducers.updateStats(state);
      })
      .addCase(searchMembershipsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearCurrentMembership,
  setCurrentMembership,
  clearUserMembership,
  setFilters,
  resetFilters,
  updateStats
} = membershipSlice.actions;

export default membershipSlice.reducer;