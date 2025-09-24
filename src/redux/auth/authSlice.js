import { createSlice } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { login, signup, getProfile, updateProfile, changePassword, logout } from './authThunks';
import { validateStoredAuth, clearStoredAuthData, storeAuthData, isTokenExpired } from '@/lib/auth-utils';

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
      
      // Clear stored auth data
      clearStoredAuthData();
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle rehydration from persisted state
      .addCase(REHYDRATE, (state, action) => {
        // Get persisted state from Redux persist
        const persistedAuth = action.payload?.auth;
        
        if (persistedAuth?.token && persistedAuth?.user && persistedAuth?.isAuthenticated) {
          // Validate the persisted token
          const persistedTokenExpired = isTokenExpired(persistedAuth.token);
          
          if (!persistedTokenExpired) {
            // Token is valid, restore auth state
            state.token = persistedAuth.token;
            state.user = persistedAuth.user;
            state.isAuthenticated = true;
            
            // Ensure localStorage is synced
            storeAuthData(persistedAuth.token, persistedAuth.user);
          } else {
            // Token expired, clear auth
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            clearStoredAuthData();
          }
        } else {
          // Check localStorage as fallback
          const validAuth = validateStoredAuth();
          if (validAuth.isAuthenticated) {
            state.token = validAuth.token;
            state.user = validAuth.user;
            state.isAuthenticated = true;
          } else {
            // No valid auth found
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
          }
        }
        
        state._persist = { ...state._persist, rehydrated: true };
        state.loading = false;
        state.error = null;
        state.initialized = true;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.initialized = true;
        state.error = null;
        
        // Ensure localStorage is always synced
        storeAuthData(action.payload.token, action.payload.user);
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
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.initialized = true;
        state.error = null;
        
        // Ensure localStorage is always synced
        storeAuthData(action.payload.token, action.payload.user);
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
        
        // Clear stored auth data
        clearStoredAuthData();
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


