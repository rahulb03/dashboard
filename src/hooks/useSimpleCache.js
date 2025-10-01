import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import dataCache from '@/utils/DataCacheManager';

/**
 * Simple caching hook that integrates with DataCacheManager
 * without complex thunk mappings to avoid deployment errors
 */
export const useSimpleCache = () => {
  const dispatch = useDispatch();

  /**
   * Smart fetch function that uses caching
   */
  const smartFetch = useCallback(async (thunkFunction, params = {}, options = {}) => {
    const { forceRefresh = false, cacheKey = 'default', cacheType = 'data' } = options;

    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cached = dataCache.get(cacheType, cacheKey);
      if (cached.cached) {
        console.log(`📦 Cache HIT for ${cacheType}:${JSON.stringify(cacheKey)}`);
        return cached.data;
      }
    }

    try {
      // Set loading state
      dataCache.setLoading(cacheType, cacheKey, true);

      // Dispatch the thunk
      const result = await dispatch(thunkFunction({ ...params, forceRefresh }));
      
      console.log(`🌐 Cache MISS for ${cacheType}:${JSON.stringify(cacheKey)} - fetched fresh data`);
      return result.payload;
    } catch (error) {
      console.error(`Smart fetch failed for ${cacheType}:`, error);
      throw error;
    } finally {
      dataCache.setLoading(cacheType, cacheKey, false);
    }
  }, [dispatch]);

  /**
   * Get cached data without triggering a fetch
   */
  const getCachedData = useCallback((cacheType, cacheKey = {}) => {
    const cached = dataCache.get(cacheType, cacheKey);
    return cached.cached ? cached.data : null;
  }, []);

  /**
   * Check if data is currently loading
   */
  const isLoading = useCallback((cacheType, cacheKey = {}) => {
    return dataCache.isLoading(cacheType, cacheKey);
  }, []);

  /**
   * Invalidate specific cache entries
   */
  const invalidateCache = useCallback((cacheType, cacheKey = {}) => {
    dataCache.invalidate(cacheType, cacheKey);
  }, []);

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    return dataCache.getDetailedStats();
  }, []);

  return {
    smartFetch,
    getCachedData,
    isLoading,
    invalidateCache,
    getCacheStats
  };
};

/**
 * Hook for specific data with auto-fetching
 */
export const useSimpleCacheData = (thunkFunction, cacheType, cacheKey = {}, options = {}) => {
  const { autoFetch = true, refreshInterval = null } = options;
  const { smartFetch, getCachedData, isLoading } = useSimpleCache();
  
  const data = getCachedData(cacheType, cacheKey);
  const loading = isLoading(cacheType, cacheKey);
  
  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      smartFetch(thunkFunction, cacheKey, { cacheKey, cacheType });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, cacheType]);
  
  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        smartFetch(thunkFunction, cacheKey, { cacheKey, cacheType, forceRefresh: true });
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval, cacheType]);
  
  const refetch = useCallback((force = false) => {
    return smartFetch(thunkFunction, cacheKey, { cacheKey, cacheType, forceRefresh: force });
  }, [smartFetch, thunkFunction, cacheKey, cacheType]);
  
  return {
    data,
    loading,
    refetch
  };
};

export default useSimpleCache;