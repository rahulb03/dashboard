import { useState, useEffect, useCallback, useRef } from 'react';
import dataCache from '../Utils/DataCacheManager';

/**
 * Enhanced custom hook for using the advanced data cache system
 * Eliminates loading states when data is cached with performance tracking
 */
export const useDataCache = (type, fetchFunction, params = {}, options = {}) => {
  const {
    enabled = true,
    refetchOnMount = false,
    refetchOnWindowFocus = false,
    staleTime = 0,
    backgroundRefresh = true,
    trackUserBehavior = true,
    enablePredictiveCaching = true
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);
  
  const mountedRef = useRef(true);
  const lastParamsRef = useRef(params);

  // Check if parameters have changed
  const paramsChanged = JSON.stringify(params) !== JSON.stringify(lastParamsRef.current);
  if (paramsChanged) {
    lastParamsRef.current = params;
  }

  const fetchData = useCallback(async (showLoading = true) => {
    if (!enabled || !fetchFunction) return;

    // Track user behavior for predictive caching
    if (trackUserBehavior) {
      dataCache.trackUserAction(`fetch_${type}`, { params, timestamp: Date.now() });
    }

    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const result = await dataCache.preload(type, fetchFunction, params);
      
      if (mountedRef.current) {
        setData(result);
        setIsStale(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
      }
    } finally {
      if (mountedRef.current && showLoading) {
        setLoading(false);
      }
    }
  }, [type, fetchFunction, params, enabled, trackUserBehavior]);

  // Background refresh without loading state
  const backgroundFetch = useCallback(async () => {
    if (!enabled || !fetchFunction || !backgroundRefresh) return;

    try {
      const result = await dataCache.backgroundRefresh(type, fetchFunction, params);
      if (result && mountedRef.current) {
        setData(result);
        setIsStale(false);
      }
    } catch (err) {
      console.warn('Background refresh failed:', err);
    }
  }, [type, fetchFunction, params, enabled, backgroundRefresh]);

  // Initial load and params change
  useEffect(() => {
    const cached = dataCache.get(type, params);
    
    if (cached.cached) {
      // Use cached data immediately
      setData(cached.data);
      setLoading(false);
      setError(null);
      
      // Check if data is stale
      const cacheAge = Date.now() - (dataCache.lastFetch.get(dataCache.generateCacheKey(type, params)) || 0);
      setIsStale(cacheAge > staleTime);
      
      // Background refresh if stale and enabled
      if (isStale && backgroundRefresh) {
        backgroundFetch();
      }
      
      // Skip fetching if we don't want to refetch on mount
      if (!refetchOnMount) return;
    }

    // Fetch data if not cached or refetch is required
    fetchData();
  }, [type, JSON.stringify(params), enabled, refetchOnMount]);

  // Window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      const cached = dataCache.get(type, params);
      if (!cached.cached) {
        fetchData(false); // Don't show loading for focus refetch
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, refetchOnWindowFocus, type, JSON.stringify(params)]);

  // Subscribe to cache updates
  useEffect(() => {
    const unsubscribe = dataCache.subscribe(type, params, (newData) => {
      if (mountedRef.current) {
        setData(newData);
        setIsStale(false);
      }
    });

    return unsubscribe;
  }, [type, JSON.stringify(params)]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Manual refetch
  const refetch = useCallback(async (showLoading = true) => {
    // Invalidate cache first
    dataCache.invalidate(type, params);
    await fetchData(showLoading);
  }, [fetchData, type, params]);

  // Invalidate cache
  const invalidate = useCallback(() => {
    dataCache.invalidate(type, params);
  }, [type, params]);

  // Get cache performance metrics
  const cacheStats = dataCache.getDetailedStats();
  const cacheKey = dataCache.generateCacheKey(type, params);
  
  return {
    data,
    loading,
    error,
    isStale,
    refetch,
    invalidate,
    backgroundRefresh: backgroundFetch,
    // Enhanced features
    cacheHitRate: cacheStats.cacheHitRate,
    isCached: dataCache.isCacheValid(cacheKey),
    cacheAge: dataCache.lastFetch.get(cacheKey) ? Date.now() - dataCache.lastFetch.get(cacheKey) : 0
  };
};

/**
 * Hook for preloading data without subscribing to updates
 * Useful for prefetching data that will be needed soon
 */
export const useDataPreload = () => {
  const preload = useCallback(async (type, fetchFunction, params = {}) => {
    return dataCache.preload(type, fetchFunction, params);
  }, []);

  const bulkPreload = useCallback(async (requests) => {
    return dataCache.bulkPreload(requests);
  }, []);

  const isLoading = useCallback((type, params = {}) => {
    return dataCache.isLoading(type, params);
  }, []);

  const getCached = useCallback((type, params = {}) => {
    return dataCache.get(type, params);
  }, []);

  return {
    preload,
    bulkPreload,
    isLoading,
    getCached
  };
};

/**
 * Hook for managing multiple related data sets
 * Useful for pages that need multiple data types
 */
export const useMultipleDataCache = (requests = []) => {
  const [states, setStates] = useState({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    const fetchAll = async () => {
      setGlobalLoading(true);
      const newStates = {};

      for (const { key, type, fetchFunction, params = {} } of requests) {
        try {
          const cached = dataCache.get(type, params);
          
          if (cached.cached) {
            newStates[key] = {
              data: cached.data,
              loading: false,
              error: null,
              cached: true
            };
          } else {
            newStates[key] = {
              data: null,
              loading: true,
              error: null,
              cached: false
            };
            
            // Start background fetch
            dataCache.preload(type, fetchFunction, params)
              .then(data => {
                if (mountedRef.current) {
                  setStates(prev => ({
                    ...prev,
                    [key]: {
                      data,
                      loading: false,
                      error: null,
                      cached: true
                    }
                  }));
                }
              })
              .catch(error => {
                if (mountedRef.current) {
                  setStates(prev => ({
                    ...prev,
                    [key]: {
                      data: null,
                      loading: false,
                      error,
                      cached: false
                    }
                  }));
                }
              });
          }
        } catch (error) {
          newStates[key] = {
            data: null,
            loading: false,
            error,
            cached: false
          };
        }
      }

      if (mountedRef.current) {
        setStates(newStates);
        
        // Check if any data is still loading
        const hasLoading = Object.values(newStates).some(state => state.loading);
        setGlobalLoading(hasLoading);
      }
    };

    fetchAll();

    return () => {
      mountedRef.current = false;
    };
  }, [requests]);

  // Update global loading when individual states change
  useEffect(() => {
    const hasLoading = Object.values(states).some(state => state.loading);
    setGlobalLoading(hasLoading);
  }, [states]);

  return {
    states,
    loading: globalLoading,
    refetchAll: () => {
      // Invalidate all caches and refetch
      requests.forEach(({ type, params = {} }) => {
        dataCache.invalidate(type, params);
      });
      // Trigger re-fetch by updating the key
      setStates({});
    }
  };
};

/**
 * Enhanced hook for cache monitoring and performance tracking
 */
export const useCacheMonitor = () => {
  const [stats, setStats] = useState(() => dataCache.getDetailedStats());
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  useEffect(() => {
    let interval;
    
    if (isMonitoring) {
      interval = setInterval(() => {
        setStats(dataCache.getDetailedStats());
      }, 1000); // Update every second when monitoring
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);
  
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);
  
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);
  
  const refreshStats = useCallback(() => {
    setStats(dataCache.getDetailedStats());
  }, []);
  
  const visualizeCache = useCallback(() => {
    dataCache.visualizeCacheState();
  }, []);
  
  const clearCache = useCallback(() => {
    dataCache.clearAll();
    refreshStats();
  }, [refreshStats]);
  
  return {
    stats,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    refreshStats,
    visualizeCache,
    clearCache
  };
};

/**
 * Hook for intelligent cache warming based on component visibility
 */
export const useCacheWarmer = (warmingConfig = []) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef();
  
  // Intersection Observer for visibility detection
  useEffect(() => {
    if (!elementRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    observer.observe(elementRef.current);
    
    return () => observer.disconnect();
  }, []);
  
  // Warm cache when component becomes visible
  useEffect(() => {
    if (!isVisible || warmingConfig.length === 0) return;
    
    const warmCache = async () => {
      for (const { type, fetchFunction, params = {}, delay = 0 } of warmingConfig) {
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        try {
          await dataCache.preload(type, fetchFunction, params);
        } catch (error) {
          console.warn(`Cache warming failed for ${type}:`, error);
        }
      }
    };
    
    // Small delay to avoid warming immediately
    setTimeout(warmCache, 100);
  }, [isVisible, warmingConfig]);
  
  return {
    elementRef,
    isVisible
  };
};

export default useDataCache;
