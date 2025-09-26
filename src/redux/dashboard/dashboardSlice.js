import { createSlice } from '@reduxjs/toolkit';
import {
  fetchDashboardOverviewThunk,
  fetchDashboardStatsThunk,
  fetchRecentActivitiesThunk,
  fetchChartDataThunk
} from './dashboardThunks';

const initialState = {
  // Overview stats (top cards)
  overviewStats: {
    totalRevenue: 0,
    newCustomers: 0,
    activeAccounts: 0,
    growthRate: 0
  },
  overviewLoading: false,
  overviewError: null,

  // Chart data for various dashboard charts
  chartData: {
    barChart: [],
    areaChart: [],
    pieChart: []
  },
  chartLoading: false,
  chartError: null,

  // Recent activities/sales
  recentActivities: [],
  activitiesLoading: false,
  activitiesError: null,

  // Dashboard summary metrics
  dashboardStats: {
    totalUsers: 0,
    totalLoans: 0,
    pendingApplications: 0,
    completedApplications: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    activeMembers: 0,
    recentTransactions: 0
  },
  statsLoading: false,
  statsError: null,

  // Cache management
  cache: {
    lastFetched: null,
    ttl: 10 * 60 * 1000, // 10 minutes cache for better performance
  },

  // Loading states for specific components
  loading: {
    overview: false,
    stats: false,
    charts: false,
    activities: false
  }
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Clear all dashboard data
    clearDashboard: (state) => {
      return { ...initialState };
    },

    // Clear specific errors
    clearOverviewError: (state) => {
      state.overviewError = null;
    },
    clearChartError: (state) => {
      state.chartError = null;
    },
    clearActivitiesError: (state) => {
      state.activitiesError = null;
    },
    clearStatsError: (state) => {
      state.statsError = null;
    },

    // Update cache timestamp
    updateCacheTimestamp: (state) => {
      state.cache.lastFetched = Date.now();
    }
  },
  extraReducers: (builder) => {
    // Dashboard Overview Stats
    builder
      .addCase(fetchDashboardOverviewThunk.pending, (state) => {
        state.overviewLoading = true;
        state.overviewError = null;
        state.loading.overview = true;
      })
      .addCase(fetchDashboardOverviewThunk.fulfilled, (state, action) => {
        state.overviewLoading = false;
        state.overviewStats = action.payload;
        state.cache.lastFetched = Date.now();
        state.loading.overview = false;
      })
      .addCase(fetchDashboardOverviewThunk.rejected, (state, action) => {
        state.overviewLoading = false;
        state.overviewError = action.payload;
        state.loading.overview = false;
      });

    // Dashboard Stats
    builder
      .addCase(fetchDashboardStatsThunk.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
        state.loading.stats = true;
      })
      .addCase(fetchDashboardStatsThunk.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.dashboardStats = action.payload;
        state.cache.lastFetched = Date.now();
        state.loading.stats = false;
      })
      .addCase(fetchDashboardStatsThunk.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
        state.loading.stats = false;
      });

    // Chart Data
    builder
      .addCase(fetchChartDataThunk.pending, (state) => {
        state.chartLoading = true;
        state.chartError = null;
        state.loading.charts = true;
      })
      .addCase(fetchChartDataThunk.fulfilled, (state, action) => {
        state.chartLoading = false;
        state.chartData = action.payload;
        state.cache.lastFetched = Date.now();
        state.loading.charts = false;
      })
      .addCase(fetchChartDataThunk.rejected, (state, action) => {
        state.chartLoading = false;
        state.chartError = action.payload;
        state.loading.charts = false;
      });

    // Recent Activities
    builder
      .addCase(fetchRecentActivitiesThunk.pending, (state) => {
        state.activitiesLoading = true;
        state.activitiesError = null;
        state.loading.activities = true;
      })
      .addCase(fetchRecentActivitiesThunk.fulfilled, (state, action) => {
        state.activitiesLoading = false;
        state.recentActivities = action.payload;
        state.cache.lastFetched = Date.now();
        state.loading.activities = false;
      })
      .addCase(fetchRecentActivitiesThunk.rejected, (state, action) => {
        state.activitiesLoading = false;
        state.activitiesError = action.payload;
        state.loading.activities = false;
      });
  }
});

export const {
  clearDashboard,
  clearOverviewError,
  clearChartError,
  clearActivitiesError,
  clearStatsError,
  updateCacheTimestamp
} = dashboardSlice.actions;

export default dashboardSlice.reducer;