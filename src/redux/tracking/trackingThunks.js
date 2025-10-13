import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constant';
import dataCache from '@/utils/DataCacheManager';
// Fetch Tracking Dashboard Analytics
export const fetchTrackingDashboardThunk = createAsyncThunk(
  'tracking/fetchDashboard',
  async ({ forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = 'tracking_dashboard';

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('tracking', { type: 'dashboard' });
        if (cached.cached) {
          return cached.data;
        }
      }

      const response = await axiosInstance.get(
        API_ENDPOINTS.TRACKING.DASHBOARD
      );
      const data = response.data;

      // Update cache with new data
      dataCache.set('tracking', data, { type: 'dashboard' });

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch tracking dashboard';
      return rejectWithValue(message);
    }
  }
);

// Fetch Tracking Sessions
export const fetchTrackingSessionsThunk = createAsyncThunk(
  'tracking/fetchSessions',
  async (
    {
      offset = 0,
      status = 'all',
      dateRange = '7d',
      phoneNumber = null,
      includeSteps = false,
      forceRefresh = false
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const cacheKey = {
        offset,
        status,
        dateRange,
        phoneNumber,
        includeSteps
      };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('trackingSessions', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({
        offset: offset.toString(),
        status,
        dateRange,
        includeSteps: includeSteps.toString(),
        ...(phoneNumber && { phoneNumber })
      });

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.TRACKING.SESSIONS}?${params}`
      );
      const data = response.data;

      // Update cache with new data
      dataCache.set('trackingSessions', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch tracking sessions';
      return rejectWithValue(message);
    }
  }
);

// Fetch Session Details
export const fetchSessionDetailsThunk = createAsyncThunk(
  'tracking/fetchSessionDetails',
  async ({ sessionId, forceRefresh = false }, { rejectWithValue }) => {
    try {
      const cacheKey = { sessionId };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('sessionDetails', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const response = await axiosInstance.get(
        API_ENDPOINTS.TRACKING.SESSION_DETAILS(sessionId)
      );
      const data = response.data;

      // Update cache with new data
      dataCache.set('sessionDetails', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch session details';
      return rejectWithValue(message);
    }
  }
);

// Fetch Funnel Analytics
export const fetchFunnelAnalyticsThunk = createAsyncThunk(
  'tracking/fetchFunnelAnalytics',
  async (
    {
      dateRange = '7d',
      startDate = null,
      endDate = null,
      forceRefresh = false
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const cacheKey = { dateRange, startDate, endDate };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('funnelAnalytics', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({
        dateRange,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.TRACKING.FUNNEL_OPTIMIZED}?${params}`
      );
      const data = response.data;

      // Update cache with new data
      dataCache.set('funnelAnalytics', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch funnel analytics';
      return rejectWithValue(message);
    }
  }
);

// Fetch Trends
export const fetchTrendsThunk = createAsyncThunk(
  'tracking/fetchTrends',
  async (
    { period = 'daily', periods = 7, forceRefresh = false } = {},
    { rejectWithValue }
  ) => {
    try {
      const cacheKey = { period, periods };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('trends', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({
        period,
        periods: periods.toString()
      });

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.TRACKING.TRENDS}?${params}`
      );
      const data = response.data;

      // Update cache with new data
      dataCache.set('trends', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch trends';
      return rejectWithValue(message);
    }
  }
);

// Fetch Stats Summary
export const fetchStatsThunk = createAsyncThunk(
  'tracking/fetchStats',
  async ({ period = '7d', forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = { period };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('statsummary', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({ period });

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.TRACKING.STATS_SUMMARY}?${params}`
      );
      const data = response.data;

      // Update cache with new data
      dataCache.set('statsummary', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch stats summary';
      return rejectWithValue(message);
    }
  }
);

// Fetch Health Status
export const fetchHealthThunk = createAsyncThunk(
  'tracking/fetchHealth',
  async ({ forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = 'health_check';

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('health', { type: 'health' });
        if (cached.cached) {
          return cached.data;
        }
      }

      const response = await axiosInstance.get(API_ENDPOINTS.TRACKING.HEALTH);
      const data = response.data;

      // Update cache with new data
      dataCache.set('health', data, { type: 'health' });

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch health status';
      return rejectWithValue(message);
    }
  }
);

// Calculate Stats (Admin only)
export const calculateStatsThunk = createAsyncThunk(
  'tracking/calculateStats',
  async ({ date = null } = {}, { rejectWithValue }) => {
    try {
      const payload = date ? { date } : {};

      const response = await axiosInstance.post(
        API_ENDPOINTS.TRACKING.CALCULATE_STATS,
        payload
      );
      const data = response.data;

      // Clear relevant caches since we manually calculated stats
      dataCache.invalidateType('tracking');
      dataCache.invalidateType('funnelAnalytics');
      dataCache.invalidateType('statsummary');

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to calculate stats';
      return rejectWithValue(message);
    }
  }
);

// Export sessions to CSV
export const exportSessionsThunk = createAsyncThunk(
  'tracking/exportSessions',
  async ({ filters = {} } = {}, { rejectWithValue }) => {
    try {
      // First fetch all sessions with current filters
      const params = new URLSearchParams({
        offset: '0',
        includeSteps: 'true', // Include step details for export
        ...filters
      });

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.TRACKING.SESSIONS}?${params}`
      );
      const { data: sessions } = response.data;

      if (!sessions || sessions.length === 0) {
        throw new Error('No sessions to export');
      }

      // Convert to CSV format
      const headers = [
        'Session ID',
        'Phone Number',
        'Started At',
        'Completed',
        'Duration (s)',
        'Current Step',
        'Drop Off Step',
        'Completion Rate (%)',
        'Device',
        'IP Address'
      ];

      const csvContent = [
        headers.join(','),
        ...sessions.map((session) =>
          [
            session.sessionId || '',
            session.adminInfo?.fullPhoneNumber || session.phoneNumber || '',
            new Date(session.startedAt).toISOString(),
            session.isCompleted ? 'Yes' : 'No',
            session.totalDuration || '',
            session.currentStep || '',
            session.dropOffStep || '',
            session.completionRate || '',
            session.adminInfo?.deviceInfo?.device || '',
            session.adminInfo?.ipAddress || ''
          ]
            .map((field) => `"${field}"`)
            .join(',')
        )
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `tracking_sessions_${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return {
        success: true,
        message: `Exported ${sessions.length} sessions to CSV`,
        exportedCount: sessions.length
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to export sessions';
      return rejectWithValue(message);
    }
  }
);

// Fetch Enhanced Funnel Analytics (uses funnel-optimized endpoint)
export const fetchEnhancedFunnelThunk = createAsyncThunk(
  'tracking/fetchEnhancedFunnel',
  async (
    {
      dateRange = '7d',
      startDate = null,
      endDate = null,
      forceRefresh = false
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const cacheKey = { dateRange, startDate, endDate };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('enhancedFunnelAnalytics', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({
        dateRange,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.TRACKING.FUNNEL_OPTIMIZED}?${params}`
      );
      const data = response.data;

      // Update cache with new data
      dataCache.set('enhancedFunnelAnalytics', data, cacheKey);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch enhanced funnel analytics';
      return rejectWithValue(message);
    }
  }
);

// Fetch Trend Analysis (uses trends endpoint)
export const fetchTrendAnalysisThunk = createAsyncThunk(
  'tracking/fetchTrendAnalysis',
  async (
    { period = 'daily', periods = 7, startDate = null, endDate = null, forceRefresh = false } = {},
    { rejectWithValue }
  ) => {
    try {
      const cacheKey = { period, periods, startDate, endDate };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('trendAnalysis', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      // Calculate date range if not provided
      const calculatedEndDate = endDate || new Date().toISOString();
      const calculatedStartDate = startDate || (() => {
        const date = new Date();
        date.setDate(date.getDate() - periods);
        return date.toISOString();
      })();

      const params = new URLSearchParams({
        period,
        periods: periods.toString(),
        ...(startDate && { startDate: calculatedStartDate }),
        ...(endDate && { endDate: calculatedEndDate })
      });

      // console.log('🌐 API Request:', `${API_ENDPOINTS.TRACKING.TRENDS}?${params}`);
      // console.log('📅 Date range:', { start: calculatedStartDate, end: calculatedEndDate });

      const response = await axiosInstance.get(
        `${API_ENDPOINTS.TRACKING.TRENDS}?${params}`
      );
      const data = response.data;

      // console.log('📥 API Response received:', data);

      // Update cache with new data
      dataCache.set('trendAnalysis', data, cacheKey);

      return data;
    } catch (error) {
      console.error('❌ Trend analysis fetch error:', error);
      const message =
        error?.response?.data?.message ||
        error.message ||
        'Failed to fetch trend analysis';
      return rejectWithValue(message);
    }
  }
);
