/**
 * Enhanced Cache Optimizer Utility
 * Prevents unnecessary API calls by implementing smart cache management
 * across all pages with deep integration to DataCacheManager
 */

import dataCache from './DataCacheManager';

class CacheOptimizer {
  constructor() {
    this.pageCache = new Map();
    this.globalTimestamps = new Map();
    this.cacheTTL = {
      dashboard: 10 * 60 * 1000, // 10 minutes for dashboard data
      tracking: 5 * 60 * 1000, // 5 minutes for tracking data
      members: 15 * 60 * 1000, // 15 minutes for member data
      loans: 5 * 60 * 1000, // 5 minutes for loan applications
      permissions: 30 * 60 * 1000, // 30 minutes for permissions
      payments: 20 * 60 * 1000, // 20 minutes for payment configs
      salary: 60 * 60 * 1000 // 1 hour for salary configs
    };

    // Excluded pages that should always refresh
    this.excludedPages = ['product-management', 'products'];
  }

  /**
   * Check if data should be fetched or use cache (enhanced with DataCacheManager)
   * @param {string} pageType - Type of page/data (dashboard, tracking, etc.)
   * @param {string} dataKey - Specific data identifier
   * @param {boolean} forceRefresh - Force refresh override
   * @param {Object} params - Parameters for cache key generation
   * @returns {boolean} - true if should fetch, false if should use cache
   */
  shouldFetchData(pageType, dataKey, forceRefresh = false, params = {}) {
    // Always fetch if force refresh is requested
    if (forceRefresh) {
      console.log(`🔄 Force refresh requested for ${pageType}:${dataKey}`);
      return true;
    }

    // Always fetch for excluded pages
    if (this.excludedPages.includes(pageType)) {
      console.log(`📄 Page ${pageType} is excluded from caching`);
      return true;
    }

    // Use DataCacheManager for advanced caching if available
    if (dataCache) {
      const cached = dataCache.get(dataKey, params);
      if (cached.cached) {
        console.log(`📦 DataCache HIT for ${dataKey}`);
        return false;
      } else {
        console.log(`🆕 DataCache MISS for ${dataKey}`);
        return true;
      }
    }

    // Fallback to legacy cache system
    const cacheKey = `${pageType}:${dataKey}`;
    const lastFetched = this.globalTimestamps.get(cacheKey);
    
    if (!lastFetched) {
      console.log(`🆕 No cache found for ${cacheKey}, fetching fresh data`);
      return true;
    }

    const ttl = this.cacheTTL[pageType] || (10 * 60 * 1000); // Default 10 minutes
    const cacheAge = Date.now() - lastFetched;
    
    if (cacheAge > ttl) {
      console.log(`⏰ Cache expired for ${cacheKey} (age: ${Math.round(cacheAge / 1000)}s, ttl: ${Math.round(ttl / 1000)}s)`);
      return true;
    }

    console.log(`📦 Using cached data for ${cacheKey} (age: ${Math.round(cacheAge / 1000)}s)`);
    return false;
  }

  /**
   * Mark data as fetched
   * @param {string} pageType - Type of page/data
   * @param {string} dataKey - Specific data identifier
   */
  markDataFetched(pageType, dataKey) {
    const cacheKey = `${pageType}:${dataKey}`;
    this.globalTimestamps.set(cacheKey, Date.now());
    console.log(`✅ Marked ${cacheKey} as fetched`);
  }

  /**
   * Invalidate cache for specific data
   * @param {string} pageType - Type of page/data
   * @param {string} dataKey - Specific data identifier (optional, if not provided, invalidates all for pageType)
   */
  invalidateCache(pageType, dataKey = null) {
    if (dataKey) {
      const cacheKey = `${pageType}:${dataKey}`;
      this.globalTimestamps.delete(cacheKey);
      console.log(`🗑️ Invalidated cache for ${cacheKey}`);
    } else {
      // Invalidate all cache entries for this page type
      const keysToDelete = [];
      for (const key of this.globalTimestamps.keys()) {
        if (key.startsWith(`${pageType}:`)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach((key) => this.globalTimestamps.delete(key));
      console.log(
        `🗑️ Invalidated all cache for ${pageType} (${keysToDelete.length} entries)`
      );
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const stats = {
      totalCacheEntries: this.globalTimestamps.size,
      cacheByType: {},
      oldestEntry: null,
      newestEntry: null
    };

    let oldestTime = Date.now();
    let newestTime = 0;

    for (const [key, timestamp] of this.globalTimestamps.entries()) {
      const [pageType] = key.split(':');
      stats.cacheByType[pageType] = (stats.cacheByType[pageType] || 0) + 1;

      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        stats.oldestEntry = { key, timestamp };
      }
      if (timestamp > newestTime) {
        newestTime = timestamp;
        stats.newestEntry = { key, timestamp };
      }
    }

    return stats;
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    const count = this.globalTimestamps.size;
    this.globalTimestamps.clear();
    this.pageCache.clear();
    console.log(`🧹 Cleared all cache (${count} entries)`);
  }

  /**
   * Clean expired cache entries
   */
  cleanExpiredCache() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, timestamp] of this.globalTimestamps.entries()) {
      const [pageType] = key.split(':');
      const ttl = this.cacheTTL[pageType] || 10 * 60 * 1000;

      if (now - timestamp > ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.globalTimestamps.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned ${keysToDelete.length} expired cache entries`);
    }
  }

  /**
   * Set custom TTL for a page type
   * @param {string} pageType - Type of page/data
   * @param {number} ttl - Time to live in milliseconds
   */
  setCustomTTL(pageType, ttl) {
    this.cacheTTL[pageType] = ttl;
    console.log(`⚙️ Set custom TTL for ${pageType}: ${ttl}ms`);
  }
}

// Create singleton instance
const cacheOptimizer = new CacheOptimizer();

// Auto-cleanup expired cache every 5 minutes
setInterval(
  () => {
    cacheOptimizer.cleanExpiredCache();
  },
  5 * 60 * 1000
);

export default cacheOptimizer;

/**
 * Hook to easily integrate cache optimization in components
 * @param {string} pageType - Type of page/data
 * @param {string} dataKey - Specific data identifier
 * @param {Function} fetchFunction - Function to call when data needs to be fetched
 * @param {Array} dependencies - useEffect dependencies
 */
export const useCacheOptimizedFetch = (
  pageType,
  dataKey,
  fetchFunction,
  dependencies = []
) => {
  const { useEffect, useRef } = require('react');
  const hasFetched = useRef(false);

  useEffect(() => {
    const shouldFetch = cacheOptimizer.shouldFetchData(
      pageType,
      dataKey,
      false
    );

    if (shouldFetch || !hasFetched.current) {
      fetchFunction();
      cacheOptimizer.markDataFetched(pageType, dataKey);
      hasFetched.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  // Return function to force refresh
  const forceRefresh = () => {
    fetchFunction(true); // Pass forceRefresh: true
    cacheOptimizer.markDataFetched(pageType, dataKey);
  };

  return { forceRefresh };
};
