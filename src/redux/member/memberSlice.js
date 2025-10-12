import { createSlice } from '@reduxjs/toolkit';
import {
  createMemberThunk,
  fetchMembersThunk,
  fetchMemberByIdThunk,
  updateMemberThunk,
  deleteMemberThunk,
  assignRoleThunk,
  fetchMembersByRoleThunk,
  bulkDeleteMembersThunk,
  searchMembersThunk
} from './memberThunks';

const initialState = {
  members: [],
  currentMember: null,
  membersByRole: [],
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
    admin: 0,
    user: 0,
    manager: 0,
    employee: 0
  },
  filters: {
    search: '',
    role: '',
    page: 1,
    limit: 10
  }
};

const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.validationErrors = {};
    },
    clearCurrentMember: (state) => {
      state.currentMember = null;
    },
    setCurrentMember: (state, action) => {
      state.currentMember = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        role: '',
        page: 1,
        limit: 10
      };
    },
    updateStats: (state) => {
      const members = state.members;
      state.stats = {
        total: members.length,
        admin: members.filter(member => member.role === 'ADMIN').length,
        user: members.filter(member => member.role === 'USER').length,
        manager: members.filter(member => member.role === 'MANAGER').length,
        employee: members.filter(member => member.role === 'EMPLOYEE').length
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Member
      .addCase(createMemberThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createMemberThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.members.push(action.payload);
        // Optimized stats update - just increment total and role count
        state.stats.total += 1;
        if (action.payload.role) {
          const roleKey = action.payload.role.toLowerCase();
          if (state.stats[roleKey] !== undefined) {
            state.stats[roleKey] += 1;
          }
        }
      })
      .addCase(createMemberThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload;
        state.validationErrors = action.payload?.validationErrors || {};
      })
      
      // Fetch All Members
      .addCase(fetchMembersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload.users || action.payload.members || action.payload;
        
        // Handle pagination if present
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        
        memberSlice.caseReducers.updateStats(state);
      })
      .addCase(fetchMembersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Member by ID
      .addCase(fetchMemberByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMember = action.payload;
      })
      .addCase(fetchMemberByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Member
      .addCase(updateMemberThunk.pending, (state) => {
        // Don't set loading to true to prevent full UI refresh
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updateMemberThunk.fulfilled, (state, action) => {
        const index = state.members.findIndex(member => member.id === action.payload.id);
        if (index !== -1) {
          const oldMember = state.members[index];
          // Update stats only if role changed
          if (oldMember.role !== action.payload.role) {
            // Decrement old role count
            const oldRoleKey = oldMember.role?.toLowerCase();
            if (oldRoleKey && state.stats[oldRoleKey] !== undefined) {
              state.stats[oldRoleKey] = Math.max(0, state.stats[oldRoleKey] - 1);
            }
            // Increment new role count
            const newRoleKey = action.payload.role?.toLowerCase();
            if (newRoleKey && state.stats[newRoleKey] !== undefined) {
              state.stats[newRoleKey] += 1;
            }
          }
          // Create a new array to ensure React detects the change
          state.members = [
            ...state.members.slice(0, index),
            action.payload,
            ...state.members.slice(index + 1)
          ];
        }
        if (state.currentMember?.id === action.payload.id) {
          state.currentMember = action.payload;
        }
      })
      .addCase(updateMemberThunk.rejected, (state, action) => {
        state.error = action.payload?.message || action.payload;
        state.validationErrors = action.payload?.validationErrors || {};
      })
      
      // Delete Member
      .addCase(deleteMemberThunk.pending, (state) => {
        // Don't set loading to true to prevent full UI refresh
        state.error = null;
      })
      .addCase(deleteMemberThunk.fulfilled, (state, action) => {
        const memberToDelete = state.members.find(member => member.id === action.payload.userId);
        if (memberToDelete) {
          // Optimized stats update - just decrement total and role count
          state.stats.total = Math.max(0, state.stats.total - 1);
          if (memberToDelete.role) {
            const roleKey = memberToDelete.role.toLowerCase();
            if (state.stats[roleKey] !== undefined) {
              state.stats[roleKey] = Math.max(0, state.stats[roleKey] - 1);
            }
          }
        }
        state.members = state.members.filter(member => member.id !== action.payload.userId);
        if (state.currentMember?.id === action.payload.userId) {
          state.currentMember = null;
        }
      })
      .addCase(deleteMemberThunk.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Assign Role
      .addCase(assignRoleThunk.pending, (state) => {
        // Don't set loading to true to prevent full UI refresh
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(assignRoleThunk.fulfilled, (state, action) => {
        const index = state.members.findIndex(member => member.id === action.payload.id);
        if (index !== -1) {
          const oldMember = state.members[index];
          // Update stats only if role changed
          if (oldMember.role !== action.payload.role) {
            // Decrement old role count
            const oldRoleKey = oldMember.role?.toLowerCase();
            if (oldRoleKey && state.stats[oldRoleKey] !== undefined) {
              state.stats[oldRoleKey] = Math.max(0, state.stats[oldRoleKey] - 1);
            }
            // Increment new role count
            const newRoleKey = action.payload.role?.toLowerCase();
            if (newRoleKey && state.stats[newRoleKey] !== undefined) {
              state.stats[newRoleKey] += 1;
            }
          }
          // Create a new array to ensure React detects the change
          state.members = [
            ...state.members.slice(0, index),
            action.payload,
            ...state.members.slice(index + 1)
          ];
        }
        if (state.currentMember?.id === action.payload.id) {
          state.currentMember = action.payload;
        }
      })
      .addCase(assignRoleThunk.rejected, (state, action) => {
        state.error = action.payload?.message || action.payload;
        state.validationErrors = action.payload?.validationErrors || {};
      })
      
      // Fetch Members by Role
      .addCase(fetchMembersByRoleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembersByRoleThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Update the main members array so optimistic updates work correctly
        state.members = action.payload.users || action.payload.members || action.payload;
        
        // Handle pagination if present
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        
        // Update stats to reflect the filtered results
        memberSlice.caseReducers.updateStats(state);
      })
      .addCase(fetchMembersByRoleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Bulk Delete Members
      .addCase(bulkDeleteMembersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkDeleteMembersThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { successful } = action.payload;
        // Optimized stats update - count deleted members by role before filtering
        const deletedMembers = state.members.filter(member => successful.includes(member.id));
        deletedMembers.forEach(member => {
          state.stats.total = Math.max(0, state.stats.total - 1);
          if (member.role) {
            const roleKey = member.role.toLowerCase();
            if (state.stats[roleKey] !== undefined) {
              state.stats[roleKey] = Math.max(0, state.stats[roleKey] - 1);
            }
          }
        });
        state.members = state.members.filter(member => !successful.includes(member.id));
      })
      .addCase(bulkDeleteMembersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search Members
      .addCase(searchMembersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMembersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload.users || action.payload.members || action.payload;
        
        // Handle pagination if present
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        
        // Only update stats for search results (this is acceptable as it's a search operation)
        memberSlice.caseReducers.updateStats(state);
      })
      .addCase(searchMembersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearCurrentMember,
  setCurrentMember,
  setFilters,
  resetFilters,
  updateStats
} = memberSlice.actions;

export default memberSlice.reducer;
