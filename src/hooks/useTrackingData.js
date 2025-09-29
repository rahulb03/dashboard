'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dataCache from '@/utils/DataCacheManager';

/**
 * Custom hook for cache-aware tracking data fetching
 * Prevents unnecessary API calls when switching between pages
 */
export const useTrackingData = (thunkAction, cacheKey, options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    dependencies = [],
    forceRefresh = false
  } = options;

  const dispatch = useDispatch();
  const fetchedRef = useRef(false);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback((params = {}) => {
    // Check if data is already cached and valid
    const cached = dataCache.get(cacheKey, params);
    
    if (cached.cached && !forceRefresh) {
      // Data is cached and valid, no need to fetch
      return Promise.resolve(cached.data);
    }

    if (cached.loading) {
      // Request is already in progress
      return Promise.resolve(null);
    }

    // Dispatch the thunk to fetch fresh data
    return dispatch(thunkAction({ ...params, forceRefresh }));
  }, [dispatch, thunkAction, cacheKey, forceRefresh]);

  const refreshData = useCallback((params = {}) => {
    return dispatch(thunkAction({ ...params, forceRefresh: true }));
  }, [dispatch, thunkAction]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (!fetchedRef.current) {
      fetchData();
      fetchedRef.current = true;
    }

    // Set up auto-refresh if enabled
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          fetchData({ forceRefresh: false }); // Let cache decide
        }
      }, refreshInterval);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, dependencies);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    fetchData,
    refreshData,
    isInitialized: fetchedRef.current
  };
};

/**
 * Hook specifically for new tracking overview data
 */
export const useNewTrackingOverview = () => {
  const dispatch = useDispatch();
  const { 
    overview, 
    overviewLoading, 
    overviewError,
    cache 
  } = useSelector((state) => state.newTracking);

  // Check if data is fresh enough to avoid refetch
  const isDataFresh = cache?.overviewLastFetched && 
    (Date.now() - cache.overviewLastFetched) < (5 * 60 * 1000); // 5 minutes

  const shouldFetch = !overviewLoading && !overview && !overviewError;
  const hasData = !!overview;

  return {
    data: overview,
    loading: overviewLoading,
    error: overviewError,
    hasData,
    isDataFresh,
    shouldFetch
  };
};

/**
 * Hook specifically for real-time tracking data
 */
export const useNewTrackingRealTime = () => {
  const dispatch = useDispatch();
  const { 
    realTimeData, 
    realTimeLoading, 
    realTimeError,
    cache 
  } = useSelector((state) => state.newTracking);

  // Real-time data has shorter freshness window
  const isDataFresh = cache?.realTimeLastFetched && 
    (Date.now() - cache.realTimeLastFetched) < (30 * 1000); // 30 seconds

  const shouldFetch = !realTimeLoading && (!realTimeData || !isDataFresh) && !realTimeError;
  const hasData = !!realTimeData;

  return {
    data: realTimeData,
    loading: realTimeLoading,
    error: realTimeError,
    hasData,
    isDataFresh,
    shouldFetch
  };
};

/**
 * Hook for active sessions with auto-refresh
 */
export const useActiveSessionsData = () => {
  const dispatch = useDispatch();
  const { 
    activeSessions, 
    activeSessionsLoading, 
    activeSessionsError 
  } = useSelector((state) => state.newTracking);

  const shouldFetch = !activeSessionsLoading && (!activeSessions?.length) && !activeSessionsError;
  const hasData = activeSessions?.length > 0;

  return {
    data: activeSessions,
    loading: activeSessionsLoading,
    error: activeSessionsError,
    hasData,
    shouldFetch,
    count: activeSessions?.length || 0
  };
};

/**
 * Generic hook for paginated tracking data with cache awareness
 */
export const usePaginatedTrackingData = (
  thunkAction, 
  cacheKeyPrefix, 
  selector, 
  defaultParams = {}
) => {
  const dispatch = useDispatch();
  const data = useSelector(selector);
  const fetchedPagesRef = useRef(new Set());

  const fetchPage = useCallback(async (params = {}) => {
    const mergedParams = { ...defaultParams, ...params };
    const pageKey = `${cacheKeyPrefix}_page_${mergedParams.page || 1}`;
    
    // Check if this specific page is cached
    const cached = dataCache.get(cacheKeyPrefix, mergedParams);
    
    if (cached.cached) {
      fetchedPagesRef.current.add(mergedParams.page || 1);
      return cached.data;
    }

    if (!fetchedPagesRef.current.has(mergedParams.page || 1)) {
      fetchedPagesRef.current.add(mergedParams.page || 1);
      return dispatch(thunkAction(mergedParams));
    }

    return null;
  }, [dispatch, thunkAction, cacheKeyPrefix, defaultParams]);

  const refreshData = useCallback((params = {}) => {
    const mergedParams = { ...defaultParams, ...params, forceRefresh: true };
    fetchedPagesRef.current.clear(); // Clear fetched pages tracking
    return dispatch(thunkAction(mergedParams));
  }, [dispatch, thunkAction, defaultParams]);

  return {
    ...data,
    fetchPage,
    refreshData,
    fetchedPages: Array.from(fetchedPagesRef.current)
  };
};

export default useTrackingData;