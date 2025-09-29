import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constant';
import dataCache from '@/utils/DataCacheManager';

// ============ DASHBOARD & OVERVIEW ============

// Fetch New Tracking Overview (using REAL API)
export const fetchNewTrackingOverviewThunk = createAsyncThunk(
  'newTracking/fetchOverview',
  async ({ forceRefresh = false, enhanced = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = { type: 'overview', enhanced };

      if (!forceRefresh) {
        const cached = dataCache.get('newTrackingOverview', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      // Use REAL tracking dashboard API
      const response = await axiosInstance.get(`${API_ENDPOINTS.TRACKING.DASHBOARD}?enhanced=${enhanced}`);
      const data = response.data;

      dataCache.set('newTrackingOverview', data, cacheKey);
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch tracking overview';
      return rejectWithValue(message);
    }
  }
);

// Fetch Real-time Analytics (using REAL API endpoint)
export const fetchRealTimeAnalyticsThunk = createAsyncThunk(
  'newTracking/fetchRealTime',
  async ({ forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = { type: 'realtime' };

      if (!forceRefresh) {
        const cached = dataCache.get('newTrackingRealTime', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      // Use REAL realtime performance API from tracking.js
      const response = await axiosInstance.get('tracking/realtime/performance');
      const data = response.data;

      dataCache.set('newTrackingRealTime', data, cacheKey);
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch real-time analytics';
      return rejectWithValue(message);
    }
  }
);

// Fetch Funnel Analytics (using REAL optimized funnel API)
export const fetchFunnelAnalyticsThunk = createAsyncThunk(
  'newTracking/fetchFunnel',
  async ({ dateRange = '7d', startDate = null, endDate = null, forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = { dateRange, startDate, endDate };

      if (!forceRefresh) {
        const cached = dataCache.get('newTrackingFunnel', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({ 
        dateRange,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });
      
      // Use REAL funnel-optimized API from tracking.js
      const response = await axiosInstance.get(`${API_ENDPOINTS.TRACKING.FUNNEL_OPTIMIZED}?${params}`);
      const data = response.data;

      dataCache.set('newTrackingFunnel', data, cacheKey);
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch funnel analytics';
      return rejectWithValue(message);
    }
  }
);

// ============ USER TRACKING ============

// Fetch Users (using REAL sessions API to get user data)
export const fetchUsersThunk = createAsyncThunk(
  'newTracking/fetchUsers',
  async ({ 
    page = 1, 
    limit = 50, 
    search = '', 
    status = 'all',
    dateRange = '30d',
    forceRefresh = false 
  } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = { page, limit, search, status, dateRange };

      if (!forceRefresh) {
        const cached = dataCache.get('newTrackingUsers', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
        status,
        dateRange,
        includeSteps: 'false',
        ...(search && { phoneNumber: search })
      });

      // Use REAL sessions API from tracking.js to get user sessions data
      const response = await axiosInstance.get(`${API_ENDPOINTS.TRACKING.SESSIONS}?${params}`);
      const data = response.data;

      // Transform sessions data to user-centric format
      const sessionsData = data.data || [];
      const userMap = new Map();
      
      // Group sessions by user (phoneNumber)
      sessionsData.forEach(session => {
        const phoneNumber = session.adminInfo?.fullPhoneNumber || session.phoneNumber || 'anonymous';
        const userId = phoneNumber;
        
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            id: userId,
            name: `User ${userId.slice(-4)}`,
            email: session.adminInfo?.fullPhoneNumber ? `${phoneNumber.slice(-4)}@user.com` : null,
            phoneNumber,
            sessionCount: 0,
            totalTime: 0,
            lastSeen: session.lastActivity,
            firstSeen: session.startedAt,
            status: session.isCompleted === false && session.lastActivity ? 'online' : 'offline',
            location: session.adminInfo?.ipAddress || 'Unknown',
            device: session.adminInfo?.deviceInfo?.device || 'Unknown'
          });
        }
        
        const user = userMap.get(userId);
        user.sessionCount++;
        user.totalTime += session.totalDuration || 0;
        
        // Update last/first seen
        if (session.lastActivity && new Date(session.lastActivity) > new Date(user.lastSeen || 0)) {
          user.lastSeen = session.lastActivity;
        }
        if (session.startedAt && new Date(session.startedAt) < new Date(user.firstSeen || Date.now())) {
          user.firstSeen = session.startedAt;
        }
      });
      
      const users = Array.from(userMap.values());
      
      // Format total time as human readable
      users.forEach(user => {
        const totalMinutes = Math.floor(user.totalTime / 60);
        const totalSeconds = user.totalTime % 60;
        user.totalTime = totalMinutes > 0 ? `${totalMinutes}m ${totalSeconds}s` : `${totalSeconds}s`;
      });
      
      const result = {
        users,
        totalUsers: data.pagination?.total || users.length,
        totalPages: Math.ceil((data.pagination?.total || users.length) / limit),
        currentPage: page,
        pagination: data.pagination || {},
        summary: data.summary || {},
        growth: Math.random() * 20 // Placeholder growth rate
      };

      dataCache.set('newTrackingUsers', result, cacheKey);
      return result;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch users';
      return rejectWithValue(message);
    }
  }
);

// Fetch User Details (using session details API with user's phoneNumber)
export const fetchUserDetailsThunk = createAsyncThunk(
  'newTracking/fetchUserDetails',
  async ({ userId, forceRefresh = false }, { rejectWithValue }) => {
    try {
      const cacheKey = { userId };

      if (!forceRefresh) {
        const cached = dataCache.get('newTrackingUserDetails', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      // Use sessions API to get user details by filtering sessions for this user
      const response = await axiosInstance.get(`${API_ENDPOINTS.TRACKING.SESSIONS}?phoneNumber=${userId}&includeSteps=true&limit=10`);
      const data = response.data;

      dataCache.set('newTrackingUserDetails', data, cacheKey);
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch user details';
      return rejectWithValue(message);
    }
  }
);

// ============ SESSION MANAGEMENT ============

// Fetch Sessions (using REAL API endpoint)
export const fetchNewSessionsThunk = createAsyncThunk(
  'newTracking/fetchSessions',
  async ({ 
    page = 1, 
    limit = 50, 
    offset = 0,
    status = 'all',
    dateRange = '7d',
    phoneNumber = null,
    includeSteps = false,
    forceRefresh = false 
  } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = { page, limit, offset, status, dateRange, phoneNumber, includeSteps };

      if (!forceRefresh) {
        const cached = dataCache.get('newTrackingSessions', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
        status,
        dateRange,
        includeSteps: includeSteps.toString(),
        ...(phoneNumber && { phoneNumber })
      });

      // Use REAL sessions API from tracking.js
      const response = await axiosInstance.get(`${API_ENDPOINTS.TRACKING.SESSIONS}?${params}`);
      const data = response.data;

      dataCache.set('newTrackingSessions', data, cacheKey);
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch sessions';
      return rejectWithValue(message);
    }
  }
);

// Fetch Session Details (using REAL API endpoint)
export const fetchNewSessionDetailsThunk = createAsyncThunk(
  'newTracking/fetchSessionDetails',
  async ({ sessionId, forceRefresh = false }, { rejectWithValue }) => {
    try {
      const cacheKey = { sessionId };

      if (!forceRefresh) {
        const cached = dataCache.get('newTrackingSessionDetails', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      // Use REAL session details API from tracking.js
      const response = await axiosInstance.get(API_ENDPOINTS.TRACKING.SESSION_DETAILS(sessionId));
      const data = response.data;

      dataCache.set('newTrackingSessionDetails', data, cacheKey);
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch session details';
      return rejectWithValue(message);
    }
  }
);

// Fetch Active Sessions (using REAL API - get active sessions from the dashboard)
export const fetchActiveSessionsThunk = createAsyncThunk(
  'newTracking/fetchActiveSessions',
  async ({ forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = { type: 'active' };

      if (!forceRefresh) {
        const cached = dataCache.get('newTrackingActiveSessions', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      // Use REAL sessions API with active status filter from tracking.js
      const response = await axiosInstance.get(`${API_ENDPOINTS.TRACKING.SESSIONS}?status=active&limit=100`);
      const data = response.data;

      // Extract active sessions data from the response
      const activeSessions = data.data || [];
      const result = {
        activeSessions,
        count: activeSessions.length,
        summary: data.summary || {}
      };

      dataCache.set('newTrackingActiveSessions', result, cacheKey);
      return result;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch active sessions';
      return rejectWithValue(message);
    }
  }
);

// ============ SMART ANALYTICS (using REAL APIs) ============

// Fetch Smart Alerts
export const fetchSmartAlertsThunk = createAsyncThunk(
  'newTracking/fetchSmartAlerts',
  async ({ timeframe = '24h', severity = 'all', forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = { timeframe, severity };

      if (!forceRefresh) {
        const cached = dataCache.get('newTrackingSmartAlerts', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({ timeframe, severity });
      // Use REAL smart alerts API from tracking.js
      const response = await axiosInstance.get(`tracking/alerts/smart?${params}`);
      const data = response.data;

      dataCache.set('newTrackingSmartAlerts', data, cacheKey);
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch smart alerts';
      return rejectWithValue(message);
    }
  }
);

// Fetch Trends Analytics
export const fetchTrendsAnalyticsThunk = createAsyncThunk(
  'newTracking/fetchTrends',
  async ({ period = 'daily', periods = 7, forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = { period, periods };

      if (!forceRefresh) {
        const cached = dataCache.get('newTrackingTrends', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({ period, periods: periods.toString() });
      // Use REAL trends API from tracking.js
      const response = await axiosInstance.get(`${API_ENDPOINTS.TRACKING.TRENDS}?${params}`);
      const data = response.data;

      dataCache.set('newTrackingTrends', data, cacheKey);
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch trends analytics';
      return rejectWithValue(message);
    }
  }
);

// Fetch Stats Summary
export const fetchStatsSummaryThunk = createAsyncThunk(
  'newTracking/fetchStatsSummary',
  async ({ period = '7d', forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = { period };

      if (!forceRefresh) {
        const cached = dataCache.get('newTrackingStatsSummary', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const params = new URLSearchParams({ period });
      // Use REAL stats summary API from tracking.js
      const response = await axiosInstance.get(`${API_ENDPOINTS.TRACKING.STATS_SUMMARY}?${params}`);
      const data = response.data;

      dataCache.set('newTrackingStatsSummary', data, cacheKey);
      return data;
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Failed to fetch stats summary';
      return rejectWithValue(message);
    }
  }
);
