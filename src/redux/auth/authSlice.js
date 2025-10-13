import { createSlice } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { login, signup, getProfile, updateProfile, updateProfilePhoto, changePassword, logout } from './authThunks';
import { isValidAdminRole } from '@/lib/auth-utils';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false, // Flag to track if auth has been initialized
  _persist: {
    version: -1,
    rehydrated: false
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setInitialized: (state) => {
      state.initialized = true;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.initialized = true; // Keep as initialized after logout
      // Cookies are cleared by the server
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle rehydration from persisted state
      .addCase(REHYDRATE, (state, action) => {
        // With cookie-based auth, we don't restore from persisted state
        // The app will check authentication by calling getProfile
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state._persist = { ...state._persist, rehydrated: true };
        state.loading = false;
        state.error = null;
        state.initialized = false; // Will be set to true after getProfile
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        
        // Validate user role before allowing access
        if (!isValidAdminRole(action.payload.user?.role)) {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.error = 'Access denied. Only ADMIN, MANAGER, and EMPLOYEE roles can access this dashboard.';
          state.initialized = true;
          return;
        }
        
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = null; // Token is in httpOnly cookie
        state.initialized = true;
        state.error = null;
        // No need to store in localStorage - cookies are managed by server
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        
        // Validate user role before allowing access
        if (!isValidAdminRole(action.payload.user?.role)) {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.error = 'Access denied. Only ADMIN, MANAGER, and EMPLOYEE roles can access this dashboard.';
          state.initialized = true;
          return;
        }
        
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = null; // Token is in httpOnly cookie
        state.initialized = true;
        state.error = null;
        // No need to store in localStorage - cookies are managed by server
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        // Cookies are cleared by the server
      })
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.initialized = true; // Mark as initialized even on failure
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfilePhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfilePhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfilePhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setInitialized, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;


