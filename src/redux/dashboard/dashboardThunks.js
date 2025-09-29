import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constant';

// Fetch dashboard overview stats (top cards)
export const fetchDashboardOverviewThunk = createAsyncThunk(
  'dashboard/fetchOverview',
  async ({ forceRefresh = false } = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const { cache } = state.dashboard;
      
      // Check cache validity unless force refresh is requested
      if (!forceRefresh && cache.lastFetched) {
        const cacheAge = Date.now() - cache.lastFetched;
        if (cacheAge < cache.ttl) {
          console.log('📦 Using cached dashboard overview data');
          return state.dashboard.overviewStats;
        }
      }
      
      console.log('🌐 Fetching fresh dashboard overview data from API');
      const response = await axiosInstance.get(API_ENDPOINTS.DASHBOARD.OVERVIEW);
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Dashboard overview fetch error:', error);
      return rejectWithValue(
        error?.response?.data?.message || 
        error.message || 
        'Failed to fetch dashboard overview'
      );
    }
  }
);

// Fetch comprehensive dashboard stats
export const fetchDashboardStatsThunk = createAsyncThunk(
  'dashboard/fetchStats',
  async ({ forceRefresh = false } = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const { cache } = state.dashboard;
      
      // Check cache validity unless force refresh is requested
      if (!forceRefresh && cache.lastFetched) {
        const cacheAge = Date.now() - cache.lastFetched;
        if (cacheAge < cache.ttl) {
          console.log('📦 Using cached dashboard stats data');
          return state.dashboard.dashboardStats;
        }
      }
      
      console.log('🌐 Fetching fresh dashboard stats data from API');
      const response = await axiosInstance.get(API_ENDPOINTS.DASHBOARD.STATS);
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Dashboard stats fetch error:', error);
      return rejectWithValue(
        error?.response?.data?.message || 
        error.message || 
        'Failed to fetch dashboard statistics'
      );
    }
  }
);

// Fetch chart data for dashboard visualizations
export const fetchChartDataThunk = createAsyncThunk(
  'dashboard/fetchChartData',
  async ({ chartType = 'all', dateRange = '30d', forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      console.log('📊 Fetching dashboard chart data:', { chartType, dateRange });
      
      const params = new URLSearchParams({
        type: chartType,
        range: dateRange
      });
      
      const response = await axiosInstance.get(`${API_ENDPOINTS.DASHBOARD.CHARTS}?${params}`);
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Dashboard chart data fetch error:', error);
      return rejectWithValue(
        error?.response?.data?.message || 
        error.message || 
        'Failed to fetch chart data'
      );
    }
  }
);

// Fetch recent activities/transactions
export const fetchRecentActivitiesThunk = createAsyncThunk(
  'dashboard/fetchRecentActivities',
  async ({ limit = 10, forceRefresh = false } = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const { cache } = state.dashboard;
      
      // Check cache validity unless force refresh is requested
      if (!forceRefresh && cache.lastFetched) {
        const cacheAge = Date.now() - cache.lastFetched;
        if (cacheAge < cache.ttl) {
          console.log('📦 Using cached recent activities data');
          return state.dashboard.recentActivities;
        }
      }
      
      console.log('🌐 Fetching fresh recent activities data from API');
      
      const params = new URLSearchParams({
        limit: limit.toString()
      });
      
      const response = await axiosInstance.get(`${API_ENDPOINTS.DASHBOARD.ACTIVITIES}?${params}`);
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Recent activities fetch error:', error);
      return rejectWithValue(
        error?.response?.data?.message || 
        error.message || 
        'Failed to fetch recent activities'
      );
    }
  }
);

// Fetch all dashboard data at once (for initial load)
export const fetchAllDashboardDataThunk = createAsyncThunk(
  'dashboard/fetchAllData',
  async ({ forceRefresh = false } = {}, { dispatch, rejectWithValue }) => {
    try {
      console.log('🚀 Fetching all dashboard data');
      
      // Fetch all dashboard data in parallel
      const results = await Promise.allSettled([
        dispatch(fetchDashboardOverviewThunk({ forceRefresh })),
        dispatch(fetchDashboardStatsThunk({ forceRefresh })),
        dispatch(fetchChartDataThunk({ forceRefresh })),
        dispatch(fetchRecentActivitiesThunk({ forceRefresh }))
      ]);
      
      // Check for any failures
      const failures = results.filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        console.warn('⚠️ Some dashboard data failed to load:', failures);
        // Don't reject completely, partial data is better than no data
      }
      
      console.log('✅ Dashboard data fetch completed');
      
      return {
        success: results.length - failures.length,
        total: results.length,
        failures: failures.length
      };
    } catch (error) {
      console.error('❌ All dashboard data fetch error:', error);
      return rejectWithValue('Failed to fetch dashboard data');
    }
  }
);

// Refresh specific dashboard component
export const refreshDashboardComponentThunk = createAsyncThunk(
  'dashboard/refreshComponent',
  async ({ component }, { dispatch, rejectWithValue }) => {
    try {
      console.log(`🔄 Refreshing dashboard component: ${component}`);
      
      switch (component) {
        case 'overview':
          await dispatch(fetchDashboardOverviewThunk({ forceRefresh: true }));
          break;
        case 'stats':
          await dispatch(fetchDashboardStatsThunk({ forceRefresh: true }));
          break;
        case 'charts':
          await dispatch(fetchChartDataThunk({ forceRefresh: true }));
          break;
        case 'activities':
          await dispatch(fetchRecentActivitiesThunk({ forceRefresh: true }));
          break;
        default:
          throw new Error(`Unknown component: ${component}`);
      }
      
      return { component, refreshed: true };
    } catch (error) {
      console.error(`❌ Error refreshing ${component}:`, error);
      return rejectWithValue(`Failed to refresh ${component}`);
    }
  }
);