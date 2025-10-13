import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Enhanced custom hook for intelligent data fetching with automatic caching
 * Includes performance tracking, request deduplication, and predictive caching
 */
export const useSmartFetch = () => {
  const dispatch = useDispatch();

  /**
   * Enhanced smart fetch with performance tracking and request deduplication
   * @param {Function} fetchThunk - Redux thunk to dispatch
   * @param {Object} options - Fetch options
   * @param {boolean} options.forceRefresh - Force refresh regardless of cache
   * @param {Object} options.params - Parameters to pass to the thunk
   * @param {Function} options.cacheValidator - Custom cache validation function
   * @param {boolean} options.trackUserBehavior - Track user behavior for predictive caching
   * @param {string} options.actionType - Action type for user behavior tracking
   */
  const smartFetch = useCallback(
    async (fetchThunk, options = {}) => {
      const {
        forceRefresh = false,
        params = {},
        cacheValidator = null,
        trackUserBehavior = true,
        actionType = 'smart_fetch'
      } = options;

      // Track user behavior for predictive caching
      if (trackUserBehavior) {
        // Import dataCache dynamically to avoid circular imports
        const { default: dataCache } = await import(
          '../utils/DataCacheManager'
        );
        dataCache.trackUserAction(actionType, {
          params,
          forceRefresh,
          timestamp: Date.now()
        });
      }

      // Always include forceRefresh in params
      const finalParams = {
        ...params,
        forceRefresh
      };

      // If custom cache validator exists, use it
      if (cacheValidator && !forceRefresh) {
        const shouldFetch = cacheValidator();
        if (!shouldFetch) {
          // console.log('Cache validation passed, skipping fetch');
          return;
        }
      }

      // Dispatch the thunk
      return dispatch(fetchThunk(finalParams));
    },
    [dispatch]
  );

  /**
   * Batch fetch multiple resources efficiently
   * @param {Array} fetchConfigs - Array of {thunk, options} objects
   */
  const batchFetch = useCallback(
    async (fetchConfigs) => {
      const promises = fetchConfigs.map(({ thunk, options }) =>
        smartFetch(thunk, options)
      );

      return Promise.allSettled(promises);
    },
    [smartFetch]
  );

  return {
    smartFetch,
    batchFetch
  };
};

/**
 * Hook for managing component-level cache states
 * Useful for preventing unnecessary re-renders
 */
export const useComponentCache = () => {
  const isDataStale = useCallback((lastFetched, ttl = 5 * 60 * 1000) => {
    if (!lastFetched) return true;
    return Date.now() - lastFetched > ttl;
  }, []);

  const createCacheKey = useCallback((...args) => {
    return JSON.stringify(args);
  }, []);

  return {
    isDataStale,
    createCacheKey
  };
};

export default useSmartFetch;
