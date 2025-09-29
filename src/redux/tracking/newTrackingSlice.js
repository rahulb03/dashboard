import { createSlice } from '@reduxjs/toolkit';
import {
  // Dashboard & Overview (REAL APIs)
  fetchNewTrackingOverviewThunk,
  fetchRealTimeAnalyticsThunk,
  fetchFunnelAnalyticsThunk,
  
  // User Tracking (REAL APIs)
  fetchUsersThunk,
  fetchUserDetailsThunk,
  
  // Session Management (REAL APIs)
  fetchNewSessionsThunk,
  fetchNewSessionDetailsThunk,
  fetchActiveSessionsThunk,
  
  // Smart Analytics (REAL APIs)
  fetchSmartAlertsThunk,
  fetchTrendsAnalyticsThunk,
  fetchStatsSummaryThunk
} from './newTrackingThunks';

const initialState = {
  // Dashboard & Overview Data (REAL)
  overview: null,
  realTimeData: null,
  funnelAnalytics: null,
  
  // User Data (REAL)
  users: null,
  currentUser: null,
  
  // Session Data (REAL)
  sessions: null,
  currentSession: null,
  activeSessions: null,
  
  // Smart Analytics Data (REAL)
  smartAlerts: null,
  trendsAnalytics: null,
  statsSummary: null,
  
  // Loading States (REAL)
  overviewLoading: false,
  realTimeLoading: false,
  funnelAnalyticsLoading: false,
  usersLoading: false,
  userDetailsLoading: false,
  sessionsLoading: false,
  sessionDetailsLoading: false,
  activeSessionsLoading: false,
  smartAlertsLoading: false,
  trendsAnalyticsLoading: false,
  statsSummaryLoading: false,
  
  // Error States (REAL)
  overviewError: null,
  realTimeError: null,
  funnelAnalyticsError: null,
  usersError: null,
  userDetailsError: null,
  sessionsError: null,
  sessionDetailsError: null,
  activeSessionsError: null,
  smartAlertsError: null,
  trendsAnalyticsError: null,
  statsSummaryError: null,
  
  // Cache Management (REAL)
  cache: {
    overviewLastFetched: null,
    realTimeLastFetched: null,
    funnelAnalyticsLastFetched: null,
    usersLastFetched: null,
    sessionsLastFetched: null,
    activeSessionsLastFetched: null,
    ttl: 2 * 60 * 1000 // 2 minutes for real-time data
  }
};

const newTrackingSlice = createSlice({
  name: 'newTracking',
  initialState,
  reducers: {
    // Clear all errors (REAL)
    clearAllErrors: (state) => {
      state.overviewError = null;
      state.realTimeError = null;
      state.funnelAnalyticsError = null;
      state.usersError = null;
      state.userDetailsError = null;
      state.sessionsError = null;
      state.sessionDetailsError = null;
      state.activeSessionsError = null;
      state.smartAlertsError = null;
      state.trendsAnalyticsError = null;
      state.statsSummaryError = null;
    },
    
    // Clear specific error
    clearError: (state, action) => {
      const { errorType } = action.payload;
      if (state[`${errorType}Error`] !== undefined) {
        state[`${errorType}Error`] = null;
      }
    },
    
    // Clear current user
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    
    // Clear current session
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
    
    // Invalidate cache (REAL)
    invalidateCache: (state, action) => {
      const { type } = action.payload || {};
      if (type === 'overview' || !type) {
        state.cache.overviewLastFetched = null;
      }
      if (type === 'realTime' || !type) {
        state.cache.realTimeLastFetched = null;
      }
      if (type === 'funnelAnalytics' || !type) {
        state.cache.funnelAnalyticsLastFetched = null;
      }
      if (type === 'users' || !type) {
        state.cache.usersLastFetched = null;
      }
      if (type === 'sessions' || !type) {
        state.cache.sessionsLastFetched = null;
      }
      if (type === 'activeSessions' || !type) {
        state.cache.activeSessionsLastFetched = null;
      }
    }
  },
  
  extraReducers: (builder) => {
    builder
      // ============ DASHBOARD & OVERVIEW (REAL APIs) ============
      
      // Overview
      .addCase(fetchNewTrackingOverviewThunk.pending, (state) => {
        state.overviewLoading = true;
        state.overviewError = null;
      })
      .addCase(fetchNewTrackingOverviewThunk.fulfilled, (state, action) => {
        state.overviewLoading = false;
        state.overview = action.payload;
        state.cache.overviewLastFetched = Date.now();
      })
      .addCase(fetchNewTrackingOverviewThunk.rejected, (state, action) => {
        state.overviewLoading = false;
        state.overviewError = action.payload;
      })
      
      // Real-time Analytics
      .addCase(fetchRealTimeAnalyticsThunk.pending, (state) => {
        state.realTimeLoading = true;
        state.realTimeError = null;
      })
      .addCase(fetchRealTimeAnalyticsThunk.fulfilled, (state, action) => {
        state.realTimeLoading = false;
        state.realTimeData = action.payload;
        state.cache.realTimeLastFetched = Date.now();
      })
      .addCase(fetchRealTimeAnalyticsThunk.rejected, (state, action) => {
        state.realTimeLoading = false;
        state.realTimeError = action.payload;
      })
      
      // Funnel Analytics
      .addCase(fetchFunnelAnalyticsThunk.pending, (state) => {
        state.funnelAnalyticsLoading = true;
        state.funnelAnalyticsError = null;
      })
      .addCase(fetchFunnelAnalyticsThunk.fulfilled, (state, action) => {
        state.funnelAnalyticsLoading = false;
        state.funnelAnalytics = action.payload;
        state.cache.funnelAnalyticsLastFetched = Date.now();
      })
      .addCase(fetchFunnelAnalyticsThunk.rejected, (state, action) => {
        state.funnelAnalyticsLoading = false;
        state.funnelAnalyticsError = action.payload;
      })
      
      // ============ USER TRACKING (REAL APIs) ============
      
      // Users
      .addCase(fetchUsersThunk.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
        state.cache.usersLastFetched = Date.now();
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload;
      })
      
      // User Details
      .addCase(fetchUserDetailsThunk.pending, (state) => {
        state.userDetailsLoading = true;
        state.userDetailsError = null;
      })
      .addCase(fetchUserDetailsThunk.fulfilled, (state, action) => {
        state.userDetailsLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserDetailsThunk.rejected, (state, action) => {
        state.userDetailsLoading = false;
        state.userDetailsError = action.payload;
      })
      
      // ============ SESSION MANAGEMENT (REAL APIs) ============
      
      // Sessions
      .addCase(fetchNewSessionsThunk.pending, (state) => {
        state.sessionsLoading = true;
        state.sessionsError = null;
      })
      .addCase(fetchNewSessionsThunk.fulfilled, (state, action) => {
        state.sessionsLoading = false;
        state.sessions = action.payload;
        state.cache.sessionsLastFetched = Date.now();
      })
      .addCase(fetchNewSessionsThunk.rejected, (state, action) => {
        state.sessionsLoading = false;
        state.sessionsError = action.payload;
      })
      
      // Session Details
      .addCase(fetchNewSessionDetailsThunk.pending, (state) => {
        state.sessionDetailsLoading = true;
        state.sessionDetailsError = null;
      })
      .addCase(fetchNewSessionDetailsThunk.fulfilled, (state, action) => {
        state.sessionDetailsLoading = false;
        state.currentSession = action.payload;
      })
      .addCase(fetchNewSessionDetailsThunk.rejected, (state, action) => {
        state.sessionDetailsLoading = false;
        state.sessionDetailsError = action.payload;
      })
      
      // Active Sessions
      .addCase(fetchActiveSessionsThunk.pending, (state) => {
        state.activeSessionsLoading = true;
        state.activeSessionsError = null;
      })
      .addCase(fetchActiveSessionsThunk.fulfilled, (state, action) => {
        state.activeSessionsLoading = false;
        state.activeSessions = action.payload;
        state.cache.activeSessionsLastFetched = Date.now();
      })
      .addCase(fetchActiveSessionsThunk.rejected, (state, action) => {
        state.activeSessionsLoading = false;
        state.activeSessionsError = action.payload;
      })
      
      // ============ SMART ANALYTICS (REAL APIs) ============
      
      // Smart Alerts
      .addCase(fetchSmartAlertsThunk.pending, (state) => {
        state.smartAlertsLoading = true;
        state.smartAlertsError = null;
      })
      .addCase(fetchSmartAlertsThunk.fulfilled, (state, action) => {
        state.smartAlertsLoading = false;
        state.smartAlerts = action.payload;
      })
      .addCase(fetchSmartAlertsThunk.rejected, (state, action) => {
        state.smartAlertsLoading = false;
        state.smartAlertsError = action.payload;
      })
      
      // Trends Analytics
      .addCase(fetchTrendsAnalyticsThunk.pending, (state) => {
        state.trendsAnalyticsLoading = true;
        state.trendsAnalyticsError = null;
      })
      .addCase(fetchTrendsAnalyticsThunk.fulfilled, (state, action) => {
        state.trendsAnalyticsLoading = false;
        state.trendsAnalytics = action.payload;
      })
      .addCase(fetchTrendsAnalyticsThunk.rejected, (state, action) => {
        state.trendsAnalyticsLoading = false;
        state.trendsAnalyticsError = action.payload;
      })
      
      // Stats Summary
      .addCase(fetchStatsSummaryThunk.pending, (state) => {
        state.statsSummaryLoading = true;
        state.statsSummaryError = null;
      })
      .addCase(fetchStatsSummaryThunk.fulfilled, (state, action) => {
        state.statsSummaryLoading = false;
        state.statsSummary = action.payload;
      })
      .addCase(fetchStatsSummaryThunk.rejected, (state, action) => {
        state.statsSummaryLoading = false;
        state.statsSummaryError = action.payload;
      });
  }
});

export const {
  clearAllErrors,
  clearError,
  clearCurrentUser,
  clearCurrentSession,
  invalidateCache
} = newTrackingSlice.actions;

export default newTrackingSlice.reducer;