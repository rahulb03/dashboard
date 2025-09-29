import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import dataCache from '@/utils/DataCacheManager';
import cacheOptimizer from '@/utils/CacheOptimizer';

// Import thunks for different modules
import { 
  fetchLoanApplicationsThunk, 
  fetchLoanApplicationByIdThunk 
} from '@/redux/Loan_Application/loanThunks';
import { 
  fetchMembersThunk, 
  fetchMemberByIdThunk 
} from '@/redux/member/memberThunks';
import { 
  fetchPaymentConfigsThunk, 
  fetchPaymentConfigByIdThunk 
} from '@/redux/payments/paymentConfigThunks';
import { 
  fetchSalariesThunk, 
  fetchSalaryByIdThunk 
} from '@/redux/salary/salaryThunks';
import { 
  fetchTrackingDashboardThunk, 
  fetchTrackingSessionsThunk 
} from '@/redux/tracking/trackingThunks';
import { 
  fetchUsersWithPermissions, 
  fetchAvailablePermissions 
} from '@/redux/permissions/permissionThunks';

/**
 * Smart caching hook that provides intelligent data fetching with caching
 * across all modules with navigation-aware preloading
 */
export const useSmartCache = () => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const navigationHistory = useRef([]);
  const preloadedData = useRef(new Set());

  /**
   * Smart fetch function that uses caching and preloading
   */
  const smartFetch = useCallback(async (dataType, params = {}, options = {}) => {
    const { forceRefresh = false, priority = 'normal' } = options;

    // Track user behavior for predictive caching
    dataCache.trackUserAction(`fetch_${dataType}`, {
      params,
      route: pathname,
      timestamp: Date.now()
    });

    // Check if we should fetch based on cache state
    const shouldFetch = cacheOptimizer.shouldFetchData(
      getPageTypeFromRoute(pathname),
      dataType,
      forceRefresh,
      params
    );

    if (!shouldFetch && !forceRefresh) {
      return dataCache.get(dataType, params).data;
    }

    // Determine which thunk to use
    const thunkFunction = getThunkForDataType(dataType);
    if (!thunkFunction) {
      console.warn(`No thunk found for data type: ${dataType}`);
      return null;
    }

    try {
      // Set loading state
      dataCache.setLoading(dataType, params, true);

      // Dispatch the appropriate thunk
      const result = await dispatch(thunkFunction({ ...params, forceRefresh }));
      
      // Mark as successfully fetched
      cacheOptimizer.markDataFetched(getPageTypeFromRoute(pathname), dataType);
      
      return result.payload;
    } catch (error) {
      console.error(`Smart fetch failed for ${dataType}:`, error);
      throw error;
    } finally {
      dataCache.setLoading(dataType, params, false);
    }
  }, [dispatch, pathname]);

  /**
   * Preload data based on navigation patterns
   */
  const preloadData = useCallback(async (dataTypes, priority = 'low') => {
    const delay = priority === 'high' ? 0 : priority === 'medium' ? 100 : 500;

    setTimeout(async () => {
      for (const { dataType, params = {} } of dataTypes) {
        const cacheKey = dataCache.generateCacheKey(dataType, params);
        
        // Skip if already preloaded or cached
        if (preloadedData.current.has(cacheKey)) continue;
        
        const cached = dataCache.get(dataType, params);
        if (cached.cached) continue;

        try {
          console.log(`🚀 Preloading ${dataType}...`);
          await smartFetch(dataType, params, { priority });
          preloadedData.current.add(cacheKey);
        } catch (error) {
          console.warn(`Preload failed for ${dataType}:`, error);
        }
        
        // Small delay between preloads to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }, delay);
  }, [smartFetch]);

  /**
   * Get cached data without triggering a fetch
   */
  const getCachedData = useCallback((dataType, params = {}) => {
    const cached = dataCache.get(dataType, params);
    return cached.cached ? cached.data : null;
  }, []);

  /**
   * Invalidate specific cache entries
   */
  const invalidateCache = useCallback((dataType, params = {}) => {
    dataCache.invalidate(dataType, params);
    const cacheKey = dataCache.generateCacheKey(dataType, params);
    preloadedData.current.delete(cacheKey);
  }, []);

  /**
   * Invalidate all cache entries of a specific type
   */
  const invalidateCacheType = useCallback((dataType) => {
    dataCache.invalidateType(dataType);
    // Remove all preloaded flags for this type
    for (const key of preloadedData.current) {
      if (key.startsWith(`${dataType}_`)) {
        preloadedData.current.delete(key);
      }
    }
  }, []);

  /**
   * Track navigation and trigger predictive loading
   */
  useEffect(() => {
    const currentRoute = pathname;
    
    // Track navigation history
    if (!navigationHistory.current.includes(currentRoute)) {
      navigationHistory.current.push(currentRoute);
      if (navigationHistory.current.length > 10) {
        navigationHistory.current.shift();
      }
    }

    // Trigger route-specific preloading
    const routeConfig = getRoutePreloadConfig(currentRoute);
    if (routeConfig) {
      // Preload critical data immediately
      if (routeConfig.critical) {
        preloadData(routeConfig.critical, 'high');
      }
      
      // Preload secondary data with delay
      if (routeConfig.secondary) {
        preloadData(routeConfig.secondary, 'medium');
      }
      
      // Preload anticipated data based on navigation patterns
      if (routeConfig.anticipated) {
        preloadData(routeConfig.anticipated, 'low');
      }
    }

    // Predictive loading based on navigation history
    const predictedRoutes = getPredictedNextRoutes(currentRoute, navigationHistory.current);
    predictedRoutes.forEach(route => {
      const config = getRoutePreloadConfig(route);
      if (config?.critical) {
        preloadData(config.critical, 'low');
      }
    });
  }, [pathname, preloadData]);

  /**
   * Background refresh for stale data
   */
  const backgroundRefresh = useCallback(async (dataType, params = {}) => {
    try {
      await dataCache.backgroundRefresh(dataType, async (fetchParams) => {
        const thunk = getThunkForDataType(dataType);
        if (thunk) {
          const result = await dispatch(thunk({ ...fetchParams, forceRefresh: true }));
          return result.payload;
        }
        return null;
      }, params);
    } catch (error) {
      console.warn(`Background refresh failed for ${dataType}:`, error);
    }
  }, [dispatch]);

  /**
   * Bulk operations
   */
  const bulkFetch = useCallback(async (requests) => {
    const promises = requests.map(({ dataType, params, options }) =>
      smartFetch(dataType, params, options).catch(error => ({ error, dataType }))
    );
    
    return await Promise.allSettled(promises);
  }, [smartFetch]);

  return {
    smartFetch,
    preloadData,
    getCachedData,
    invalidateCache,
    invalidateCacheType,
    backgroundRefresh,
    bulkFetch,
    // Cache utilities
    isLoading: (dataType, params = {}) => dataCache.isLoading(dataType, params),
    isCached: (dataType, params = {}) => dataCache.get(dataType, params).cached,
    getCacheStats: () => dataCache.getDetailedStats(),
    getOptimizationRecommendations: () => cacheOptimizer.getCacheStats()
  };
};

/**
 * Hook for specific data types with built-in caching
 */
export const useSmartCacheData = (dataType, params = {}, options = {}) => {
  const { smartFetch, getCachedData, isLoading } = useSmartCache();
  const { autoFetch = true, refreshInterval = null } = options;
  
  const data = getCachedData(dataType, params);
  const loading = isLoading(dataType, params);
  
  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      smartFetch(dataType, params, options);
    }
  }, [smartFetch, dataType, JSON.stringify(params), autoFetch]);
  
  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        smartFetch(dataType, params, { ...options, forceRefresh: true });
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval, smartFetch, dataType, JSON.stringify(params), options]);
  
  const refetch = useCallback((force = false) => {
    return smartFetch(dataType, params, { ...options, forceRefresh: force });
  }, [smartFetch, dataType, params, options]);
  
  return {
    data,
    loading,
    refetch
  };
};

// Helper functions
function getPageTypeFromRoute(route) {
  const routeMapping = {
    '/dashboard/loans': 'loans',
    '/dashboard/members': 'members',
    '/dashboard/tracking': 'tracking',
    '/dashboard/permissions': 'permissions',
    '/dashboard/salary': 'salary',
    '/dashboard/payments': 'payments'
  };
  
  for (const [pattern, type] of Object.entries(routeMapping)) {
    if (route.startsWith(pattern)) return type;
  }
  
  return 'dashboard';
}

function getThunkForDataType(dataType) {
  const thunkMapping = {
    // Loan applications
    loanApplications: fetchLoanApplicationsThunk,
    loanApplication: fetchLoanApplicationByIdThunk,
    
    // Members
    members: fetchMembersThunk,
    member: fetchMemberByIdThunk,
    
    // Payment configurations
    paymentConfigs: fetchPaymentConfigsThunk,
    paymentConfig: fetchPaymentConfigByIdThunk,
    
    // Salary configurations
    salaries: fetchSalariesThunk,
    salary: fetchSalaryByIdThunk,
    
    // Tracking
    tracking: fetchTrackingDashboardThunk,
    trackingSessions: fetchTrackingSessionsThunk,
    
    // Permissions
    users: fetchUsersWithPermissions,
    permissions: fetchAvailablePermissions
  };
  
  return thunkMapping[dataType];
}

function getRoutePreloadConfig(route) {
  const configs = {
    '/dashboard/loans': {
      critical: [{ dataType: 'loanApplications' }],
      secondary: [{ dataType: 'members' }, { dataType: 'paymentConfigs' }],
      anticipated: [{ dataType: 'permissions' }]
    },
    '/dashboard/loans/applications': {
      critical: [{ dataType: 'loanApplications' }, { dataType: 'members' }],
      secondary: [{ dataType: 'paymentConfigs' }],
      anticipated: [{ dataType: 'permissions' }]
    },
    '/dashboard/members': {
      critical: [{ dataType: 'members' }],
      secondary: [{ dataType: 'permissions' }, { dataType: 'users' }],
      anticipated: [{ dataType: 'loanApplications' }]
    },
    '/dashboard/tracking': {
      critical: [{ dataType: 'tracking' }],
      secondary: [{ dataType: 'trackingSessions' }],
      anticipated: []
    },
    '/dashboard/permissions': {
      critical: [{ dataType: 'users' }, { dataType: 'permissions' }],
      secondary: [],
      anticipated: [{ dataType: 'members' }]
    },
    '/dashboard/salary': {
      critical: [{ dataType: 'salaries' }],
      secondary: [{ dataType: 'members' }],
      anticipated: []
    },
    '/dashboard/payments': {
      critical: [{ dataType: 'paymentConfigs' }],
      secondary: [],
      anticipated: [{ dataType: 'loanApplications' }]
    }
  };
  
  return configs[route];
}

function getPredictedNextRoutes(currentRoute, history) {
  // Simple prediction based on common navigation patterns
  const predictions = {
    '/dashboard/loans': ['/dashboard/loans/applications', '/dashboard/members'],
    '/dashboard/members': ['/dashboard/permissions', '/dashboard/loans'],
    '/dashboard/tracking': ['/dashboard/loans'],
    '/dashboard/permissions': ['/dashboard/members'],
    '/dashboard/salary': ['/dashboard/members'],
    '/dashboard/payments': ['/dashboard/loans']
  };
  
  return predictions[currentRoute] || [];
}

export default useSmartCache;