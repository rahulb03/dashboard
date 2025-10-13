import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUsersWithPermissions,
  fetchAvailablePermissions,
  grantPermission,
  revokePermission,
  fetchUserPermissionHistory
} from './permissionThunks';

// Initial state
const initialState = {
  users: [],
  availablePermissions: {
    categories: [],
    totalPermissions: 0
  },
  selectedUser: null,
  selectedPermission: null,
  permissionHistory: null,
  loading: {
    users: false,
    permissions: false,
    grant: false,
    revoke: false,
    history: false
  },
  error: {
    users: null,
    permissions: null,
    grant: null,
    revoke: null,
    history: null
  },
  successMessage: null,
  filters: {
    search: '',
    role: ''
  },
  // Cache management
  cache: {
    users: {
      lastFetched: null,
      currentQuery: null,
      ttl: 5 * 60 * 1000 // 5 minutes
    },
    permissions: {
      lastFetched: null,
      ttl: 15 * 60 * 1000 // 15 minutes (permissions change less frequently)
    }
  }
};

// Create the slice
const permissionSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      state.permissionHistory = null; // Clear history when selecting new user
    },
    setSelectedPermission: (state, action) => {
      state.selectedPermission = action.payload;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearErrors: (state) => {
      state.error = {
        users: null,
        permissions: null,
        grant: null,
        revoke: null,
        history: null
      };
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetPermissionState: (state) => {
      return initialState;
    },
    // Cache management
    invalidateUsersCache: (state) => {
      state.cache.users.lastFetched = null;
      state.cache.users.currentQuery = null;
    },
    invalidatePermissionsCache: (state) => {
      state.cache.permissions.lastFetched = null;
    },
    // Smart cache-aware data updates
    updateUserPermissionOptimistic: (state, action) => {
      const { userId, permission, operation } = action.payload;
      const userIndex = state.users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        if (operation === 'grant') {
          const existingIndex = state.users[userIndex].permissions.findIndex(p => p.id === permission.id);
          if (existingIndex === -1) {
            state.users[userIndex].permissions.push(permission);
          }
        } else if (operation === 'revoke') {
          state.users[userIndex].permissions = state.users[userIndex].permissions.filter(
            p => p.id !== permission.id
          );
        }
        
        // Update selectedUser if it matches
        if (state.selectedUser?.id === userId) {
          state.selectedUser = { ...state.users[userIndex] };
        }
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch users with permissions
    builder
      .addCase(fetchUsersWithPermissions.pending, (state) => {
        state.loading.users = true;
        state.error.users = null;
      })
      .addCase(fetchUsersWithPermissions.fulfilled, (state, action) => {
        state.loading.users = false;
        
        // Debug: Log what payload we're getting
        // console.log('🚀 Redux Slice Users Fulfilled:', {
        //   actionPayload: action.payload,
        //   isArray: Array.isArray(action.payload),
        //   payloadLength: action.payload?.length,
        //   payloadType: typeof action.payload,
        //   firstItem: action.payload?.[0]
        // });
        
        // The thunk now returns the users array directly
        if (Array.isArray(action.payload)) {
          state.users = action.payload;
        } else {
          console.warn('⚠️ Expected array but got:', typeof action.payload, action.payload);
          state.users = [];
        }
        
        // Update cache metadata
        state.cache.users.lastFetched = Date.now();
        state.cache.users.currentQuery = JSON.stringify({
          search: state.filters.search,
          role: state.filters.role
        });
      })
      .addCase(fetchUsersWithPermissions.rejected, (state, action) => {
        state.loading.users = false;
        state.error.users = action.payload || 'Failed to fetch users';
      });

    // Fetch available permissions
    builder
      .addCase(fetchAvailablePermissions.pending, (state) => {
        state.loading.permissions = true;
        state.error.permissions = null;
      })
      .addCase(fetchAvailablePermissions.fulfilled, (state, action) => {
        state.loading.permissions = false;
        
        // Debug: Log what payload we're getting for permissions
        // console.log('🚀 Redux Slice Permissions Fulfilled:', {
        //   actionPayload: action.payload,
        //   hasCategories: action.payload?.categories ? true : false,
        //   categoriesLength: action.payload?.categories?.length,
        //   totalPermissions: action.payload?.totalPermissions
        // });
        
        state.availablePermissions = action.payload;
        
        // Update cache metadata
        state.cache.permissions.lastFetched = Date.now();
      })
      .addCase(fetchAvailablePermissions.rejected, (state, action) => {
        state.loading.permissions = false;
        state.error.permissions = action.payload || 'Failed to fetch permissions';
      });

    // Grant permission
    builder
      .addCase(grantPermission.pending, (state) => {
        state.loading.grant = true;
        state.error.grant = null;
        state.successMessage = null;
      })
      .addCase(grantPermission.fulfilled, (state, action) => {
        state.loading.grant = false;
        state.successMessage = action.payload.message || 'Permission granted successfully';
        
        // Optimistic update: find and update the user in the users array
        const { user, permission } = action.payload.data || {};
        if (user && permission && state.selectedUser) {
          const userIndex = state.users.findIndex(u => u.id === state.selectedUser.id);
          if (userIndex !== -1) {
            // Add the new permission to the user's permissions
            const existingPermissionIndex = state.users[userIndex].permissions.findIndex(
              p => p.id === permission.id
            );
            
            if (existingPermissionIndex === -1) {
              // Add new permission
              state.users[userIndex].permissions.push({
                id: permission.id,
                name: permission.name,
                description: permission.description,
                source: 'user'
              });
            } else {
              // Update existing permission
              state.users[userIndex].permissions[existingPermissionIndex] = {
                ...state.users[userIndex].permissions[existingPermissionIndex],
                source: 'user'
              };
            }
            
            // Update selectedUser if it matches
            if (state.selectedUser.id === state.users[userIndex].id) {
              state.selectedUser = { ...state.users[userIndex] };
            }
          }
        }
      })
      .addCase(grantPermission.rejected, (state, action) => {
        state.loading.grant = false;
        const error = action.payload;
        state.error.grant = typeof error === 'object' && error.message ? error.message : error || 'Failed to grant permission';
      });

    // Revoke permission
    builder
      .addCase(revokePermission.pending, (state) => {
        state.loading.revoke = true;
        state.error.revoke = null;
        state.successMessage = null;
      })
      .addCase(revokePermission.fulfilled, (state, action) => {
        state.loading.revoke = false;
        state.successMessage = action.payload.message || 'Permission revoked successfully';
        
        // Optimistic update: find and remove the permission from user's permissions
        const { user, permission } = action.payload.data || {};
        if (user && permission && state.selectedUser) {
          const userIndex = state.users.findIndex(u => u.id === state.selectedUser.id);
          if (userIndex !== -1) {
            // Remove the permission from the user's permissions
            state.users[userIndex].permissions = state.users[userIndex].permissions.filter(
              p => p.id !== permission.id
            );
            
            // Update selectedUser if it matches
            if (state.selectedUser.id === state.users[userIndex].id) {
              state.selectedUser = { ...state.users[userIndex] };
            }
          }
        }
      })
      .addCase(revokePermission.rejected, (state, action) => {
        state.loading.revoke = false;
        const error = action.payload;
        state.error.revoke = typeof error === 'object' && error.message ? error.message : error || 'Failed to revoke permission';
      });

    // Fetch permission history
    builder
      .addCase(fetchUserPermissionHistory.pending, (state) => {
        state.loading.history = true;
        state.error.history = null;
      })
      .addCase(fetchUserPermissionHistory.fulfilled, (state, action) => {
        state.loading.history = false;
        state.permissionHistory = action.payload;
      })
      .addCase(fetchUserPermissionHistory.rejected, (state, action) => {
        state.loading.history = false;
        state.error.history = action.payload || 'Failed to fetch history';
      });
  }
});

// Export actions
export const {
  setSelectedUser,
  setSelectedPermission,
  clearSuccessMessage,
  clearErrors,
  setFilters,
  resetPermissionState,
  invalidateUsersCache,
  invalidatePermissionsCache,
  updateUserPermissionOptimistic
} = permissionSlice.actions;

// Export reducer
export default permissionSlice.reducer;