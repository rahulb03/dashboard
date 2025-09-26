import { createSlice } from '@reduxjs/toolkit';
import {
  fetchTrackingDashboardThunk,
  fetchTrackingSessionsThunk,
  fetchSessionDetailsThunk,
  fetchFunnelAnalyticsThunk,
  fetchTrendsThunk,
  fetchStatsThunk,
  fetchHealthThunk,
  calculateStatsThunk,
  fetchEnhancedFunnelThunk,
  fetchTrendAnalysisThunk
} from './trackingThunks';

const initialState = {
  // Dashboard data
  dashboard: null,
  
  // Sessions data
  sessions: [],
  currentSession: null,
  sessionsPagination: {
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  },
  sessionsFilters: {
    status: 'all',
    dateRange: '7d',
    phoneNumber: null,
    includeSteps: false
  },
  
  // Analytics data
  funnelAnalytics: null,
  enhancedFunnel: null,
  trends: null,
  trendAnalysis: null,
  statsummary: null,
  
  // Calculate Stats result
  calculateStatsResult: null,
  
  // System data
  health: null,
  
  // Loading states
  loading: false,
  dashboardLoading: false,
  sessionsLoading: false,
  sessionDetailsLoading: false,
  analyticsLoading: false,
  enhancedFunnelLoading: false,
  trendAnalysisLoading: false,
  calculateStatsLoading: false,
  healthLoading: false,
  
  // Error states
  error: null,
  dashboardError: null,
  sessionsError: null,
  sessionDetailsError: null,
  analyticsError: null,
  enhancedFunnelError: null,
  trendAnalysisError: null,
  calculateStatsError: null,
  healthError: null,
  
  // Cache management
  cache: {
    dashboardLastFetched: null,
    sessionsLastFetched: null,
    analyticsLastFetched: null,
    healthLastFetched: null,
    ttl: 5 * 60 * 1000 // 5 minutes for tracking data
  }
};

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.dashboardError = null;
      state.sessionsError = null;
      state.sessionDetailsError = null;
      state.analyticsError = null;
      state.enhancedFunnelError = null;
      state.trendAnalysisError = null;
      state.calculateStatsError = null;
      state.healthError = null;
    },

    // Clear calculate stats result
    clearCalculateStatsResult: (state) => {
      state.calculateStatsResult = null;
      state.calculateStatsError = null;
    },

    // Clear analytics data
    clearAnalytics: (state) => {
      state.funnelAnalytics = null;
      state.enhancedFunnel = null;
      state.trends = null;
      state.trendAnalysis = null;
      state.analyticsError = null;
      state.enhancedFunnelError = null;
      state.trendAnalysisError = null;
    },
    
    // Clear current session
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
    
    // Update sessions filters
    updateSessionsFilters: (state, action) => {
      state.sessionsFilters = { ...state.sessionsFilters, ...action.payload };
    },
    
    // Reset sessions pagination
    resetSessionsPagination: (state) => {
      state.sessionsPagination = {
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false
      };
    },
    
    // Invalidate cache
    invalidateCache: (state, action) => {
      const { type } = action.payload || {};
      if (type === 'dashboard' || !type) {
        state.cache.dashboardLastFetched = null;
      }
      if (type === 'sessions' || !type) {
        state.cache.sessionsLastFetched = null;
      }
      if (type === 'analytics' || !type) {
        state.cache.analyticsLastFetched = null;
      }
      if (type === 'health' || !type) {
        state.cache.healthLastFetched = null;
      }
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Dashboard Analytics
      .addCase(fetchTrackingDashboardThunk.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchTrackingDashboardThunk.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload;
        state.cache.dashboardLastFetched = Date.now();
      })
      .addCase(fetchTrackingDashboardThunk.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload;
      })
      
      // Sessions
      .addCase(fetchTrackingSessionsThunk.pending, (state) => {
        state.sessionsLoading = true;
        state.sessionsError = null;
      })
      .addCase(fetchTrackingSessionsThunk.fulfilled, (state, action) => {
        state.sessionsLoading = false;
        const { data, pagination, filters } = action.payload;
        
        // Handle pagination - append or replace
        if (pagination.offset === 0) {
          state.sessions = data;
        } else {
          state.sessions = [...state.sessions, ...data];
        }
        
        state.sessionsPagination = pagination;
        state.sessionsFilters = { ...state.sessionsFilters, ...filters };
        state.cache.sessionsLastFetched = Date.now();
      })
      .addCase(fetchTrackingSessionsThunk.rejected, (state, action) => {
        state.sessionsLoading = false;
        state.sessionsError = action.payload;
      })
      
      // Session Details
      .addCase(fetchSessionDetailsThunk.pending, (state) => {
        state.sessionDetailsLoading = true;
        state.sessionDetailsError = null;
      })
      .addCase(fetchSessionDetailsThunk.fulfilled, (state, action) => {
        state.sessionDetailsLoading = false;
        state.currentSession = action.payload.data;
      })
      .addCase(fetchSessionDetailsThunk.rejected, (state, action) => {
        state.sessionDetailsLoading = false;
        state.sessionDetailsError = action.payload;
      })
      
      // Funnel Analytics
      .addCase(fetchFunnelAnalyticsThunk.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(fetchFunnelAnalyticsThunk.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.funnelAnalytics = action.payload;
        state.cache.analyticsLastFetched = Date.now();
      })
      .addCase(fetchFunnelAnalyticsThunk.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload;
      })
      
      // Trends
      .addCase(fetchTrendsThunk.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(fetchTrendsThunk.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.trends = action.payload;
      })
      .addCase(fetchTrendsThunk.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload;
      })
      
      // Stats Summary
      .addCase(fetchStatsThunk.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(fetchStatsThunk.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.statsummary = action.payload.data;
      })
      .addCase(fetchStatsThunk.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload;
      })
      
      // Health Check
      .addCase(fetchHealthThunk.pending, (state) => {
        state.healthLoading = true;
        state.healthError = null;
      })
      .addCase(fetchHealthThunk.fulfilled, (state, action) => {
        state.healthLoading = false;
        state.health = action.payload;
        state.cache.healthLastFetched = Date.now();
      })
      .addCase(fetchHealthThunk.rejected, (state, action) => {
        state.healthLoading = false;
        state.healthError = action.payload;
      })
      
      // Calculate Stats
      .addCase(calculateStatsThunk.pending, (state) => {
        state.calculateStatsLoading = true;
        state.calculateStatsError = null;
        state.calculateStatsResult = null;
      })
      .addCase(calculateStatsThunk.fulfilled, (state, action) => {
        state.calculateStatsLoading = false;
        state.calculateStatsResult = action.payload;
        // Invalidate cache after manual stats calculation
        state.cache.dashboardLastFetched = null;
        state.cache.analyticsLastFetched = null;
      })
      .addCase(calculateStatsThunk.rejected, (state, action) => {
        state.calculateStatsLoading = false;
        state.calculateStatsError = action.payload;
      })
      
      // Enhanced Funnel Analytics
      .addCase(fetchEnhancedFunnelThunk.pending, (state) => {
        state.enhancedFunnelLoading = true;
        state.enhancedFunnelError = null;
      })
      .addCase(fetchEnhancedFunnelThunk.fulfilled, (state, action) => {
        state.enhancedFunnelLoading = false;
        state.enhancedFunnel = action.payload;
      })
      .addCase(fetchEnhancedFunnelThunk.rejected, (state, action) => {
        state.enhancedFunnelLoading = false;
        state.enhancedFunnelError = action.payload;
      })
      
      // Trend Analysis
      .addCase(fetchTrendAnalysisThunk.pending, (state) => {
        state.trendAnalysisLoading = true;
        state.trendAnalysisError = null;
      })
      .addCase(fetchTrendAnalysisThunk.fulfilled, (state, action) => {
        state.trendAnalysisLoading = false;
        state.trendAnalysis = action.payload;
      })
      .addCase(fetchTrendAnalysisThunk.rejected, (state, action) => {
        state.trendAnalysisError = action.payload;
        state.trendAnalysisLoading = false;
      });
  }
});

export const {
  clearError,
  clearCurrentSession,
  updateSessionsFilters,
  resetSessionsPagination,
  invalidateCache,
  clearCalculateStatsResult,
  clearAnalytics
} = trackingSlice.actions;

export default trackingSlice.reducer;