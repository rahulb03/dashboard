/**
 * Enhanced Global Data Cache Manager
 * Advanced caching system with request deduplication, performance monitoring,
 * memory management, persistence, and intelligent prefetching
 */

class DataCacheManager {
  constructor() {
    // Core cache storage
    this.cache = new Map();
    this.loadingStates = new Map();
    this.lastFetch = new Map();
    this.subscribers = new Map();

    // Request deduplication
    this.pendingRequests = new Map();

    // Performance monitoring
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0
    };
    this.responseTimeHistory = [];

    // Memory management
    this.maxCacheSize = 1000; // Maximum number of cache entries
    this.accessOrder = new Map(); // Track access order for LRU

    // Error handling and retry
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.baseRetryDelay = 1000; // 1 second

    // Cache persistence
    this.persistenceKey = 'dataCache_v1';
    this.persistableCacheTypes = ['users', 'permissions', 'settings', 'roles']; // Only persist certain types

    // User behavior tracking
    this.userPatterns = new Map(); // Track user navigation patterns
    this.warmingQueue = [];
    this.isWarming = false;
    this.sessionId = this._generateSessionId();

    // Cache expiration times (in milliseconds)
    // IMPORTANT: Short TTLs for admin dashboard to ensure fresh data after deletions/updates
    this.cacheExpiry = {
      users: 2 * 60 * 1000, // 2 minutes (reduced for admin freshness)
      members: 2 * 60 * 1000, // 2 minutes (reduced for admin freshness)
      permissions: 5 * 60 * 1000, // 5 minutes (reduced for admin changes)
      categories: 10 * 60 * 1000, // 10 minutes (reduced)
      roles: 10 * 60 * 1000, // 10 minutes (reduced)
      settings: 30 * 60 * 1000, // 30 minutes (reduced)
      history: 1 * 60 * 1000, // 1 minute (very short for real-time feel)
      salary: 2 * 60 * 1000, // 2 minutes (reduced)
      salaries: 2 * 60 * 1000, // 2 minutes (reduced)
      salariesByEmploymentType: 2 * 60 * 1000, // 2 minutes (reduced)
      searchSalaries: 1 * 60 * 1000, // 1 minute (search results cache very short)
      // Tracking cache expiry times
      tracking: 2 * 60 * 1000, // 2 minutes (tracking data changes frequently)
      trackingSessions: 1 * 60 * 1000, // 1 minute (sessions are dynamic)
      sessionDetails: 5 * 60 * 1000, // 5 minutes (session details change less)
      funnelAnalytics: 10 * 60 * 1000, // 10 minutes (analytics can be cached longer)
      trends: 15 * 60 * 1000, // 15 minutes
      statsummary: 5 * 60 * 1000, // 5 minutes
      health: 30 * 1000, // 30 seconds (health checks should be frequent)
      // Loan application cache expiry times
      loanApplications: 3 * 60 * 1000, // 3 minutes (loan lists change frequently)
      loanApplication: 5 * 60 * 1000, // 5 minutes (individual loans)
      loanDocuments: 10 * 60 * 1000, // 10 minutes (documents don't change often)
      // Payment configuration cache expiry times
      paymentConfig: 5 * 60 * 1000, // 5 minutes (individual payment configs)
      paymentConfigs: 3 * 60 * 1000, // 3 minutes (payment config lists)
      activePaymentConfigs: 5 * 60 * 1000, // 5 minutes (active configs don't change often)
      // Membership cache expiry times - CRITICAL: Short TTLs for real-time admin data
      membership: 1 * 60 * 1000, // 1 minute (individual memberships - very short for delete visibility)
      memberships: 1 * 60 * 1000, // 1 minute (membership lists - very short for delete visibility)
      userMembership: 2 * 60 * 1000, // 2 minutes (user's own membership)
      membershipStats: 2 * 60 * 1000, // 2 minutes (membership statistics - update after deletions)
      searchMemberships: 30 * 1000, // 30 seconds (search results very short)
      // Payment cache expiry times - CRITICAL: Short TTLs for real-time admin data
      payment: 1 * 60 * 1000, // 1 minute (individual payments - very short for delete visibility)
      payments: 1 * 60 * 1000, // 1 minute (payment lists - very short for delete visibility)
      userPayments: 2 * 60 * 1000, // 2 minutes (user payment history)
      searchPayments: 30 * 1000, // 30 seconds (search results very short)
      
      // New Tracking System cache expiry times
      newTrackingOverview: 5 * 60 * 1000, // 5 minutes (overview data)
      newTrackingRealTime: 30 * 1000, // 30 seconds (real-time data)
      newTrackingPerformance: 10 * 60 * 1000, // 10 minutes (performance metrics)
      newTrackingUsers: 5 * 60 * 1000, // 5 minutes (user lists)
      newTrackingUserDetails: 10 * 60 * 1000, // 10 minutes (individual users)
      newTrackingSessions: 2 * 60 * 1000, // 2 minutes (session lists)
      newTrackingSessionDetails: 5 * 60 * 1000, // 5 minutes (session details)
      newTrackingActiveSessions: 30 * 1000, // 30 seconds (active sessions)
      newTrackingEvents: 3 * 60 * 1000, // 3 minutes (event lists)
      newTrackingEventAnalytics: 10 * 60 * 1000, // 10 minutes (event analytics)
      newTrackingPageAnalytics: 15 * 60 * 1000, // 15 minutes (page analytics)
      newTrackingPopularPages: 20 * 60 * 1000, // 20 minutes (popular pages)
      newTrackingConversions: 10 * 60 * 1000, // 10 minutes (conversions)
      newTrackingConversionFunnel: 15 * 60 * 1000, // 15 minutes (conversion funnel)
      newTrackingCustomReport: 30 * 60 * 1000, // 30 minutes (custom reports)
      newTrackingExport: 60 * 60 * 1000 // 1 hour (export data)
    };

    // Initialize enhanced features
    this._hydrateCacheFromStorage();
    this._setupAutoPersistence();
    this._startPeriodicCleanup();

    // Debug mode detection
    this.debugMode =
      typeof window !== 'undefined' &&
      window.location?.hostname === 'localhost';
  }

  /**
   * Generate cache key with filters/params
   */
  generateCacheKey(type, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    return `${type}_${JSON.stringify(sortedParams)}`;
  }

  /**
   * Check if cached data is still valid
   */
  isCacheValid(key) {
    const lastFetch = this.lastFetch.get(key);
    const cacheType = key.split('_')[0];
    const expiry = this.cacheExpiry[cacheType] || 5 * 60 * 1000; // Default 5 minutes

    if (!lastFetch) return false;

    return Date.now() - lastFetch < expiry;
  }

  /**
   * Get data from cache with performance tracking and LRU management
   */
  get(type, params = {}) {
    const key = this.generateCacheKey(type, params);

    if (this.isCacheValid(key)) {
      this.accessOrder.set(key, Date.now()); // Update access time for LRU
      this._recordCacheHit(key, true);

      if (this.debugMode) {
        // conso/le.log(`🎯 Cache HIT: ${key}`);
      }

      return {
        data: this.cache.get(key),
        cached: true,
        loading: false
      };
    }

    this._recordCacheHit(key, false);

    if (this.debugMode) {
      // console.log(`❌ Cache MISS: ${key}`);
    }

    return {
      data: null,
      cached: false,
      loading: this.loadingStates.get(key) || false
    };
  }

  /**
   * Set data in cache with memory management and persistence
   */
  set(type, data, params = {}) {
    const key = this.generateCacheKey(type, params);

    // Evict LRU entries if needed
    this._evictLRUIfNeeded();

    this.cache.set(key, data);
    this.lastFetch.set(key, Date.now());
    this.loadingStates.set(key, false);
    this.accessOrder.set(key, Date.now());

    // if (this.debugMode) {
    //   console.log(`💾 Cache SET: ${key}`, {
    //     dataSize: JSON.stringify(data).length
    //   });
    // }

    // Notify subscribers of data update
    this.notifySubscribers(key, data);

    // Trigger debounced persistence
    this._persistDebounced();
  }

  /**
   * Optimistically update cached data without API call
   */
  optimisticUpdate(type, updateFunction, params = {}) {
    const key = this.generateCacheKey(type, params);
    const currentData = this.cache.get(key);

    if (currentData) {
      const updatedData = updateFunction(currentData);
      this.set(type, updatedData, params);
    }

    // Also update related cache entries
    this.updateRelatedCaches(type, updateFunction, params);
  }

  /**
   * Update related cache entries based on data relationships
   */
  updateRelatedCaches(type, updateFunction, params) {
    // Find all cache keys that might be related
    for (const [cacheKey, cacheData] of this.cache.entries()) {
      const [cacheType] = cacheKey.split('_');

      // Update related caches (e.g., user updates should update user lists)
      if (this.areTypesRelated(type, cacheType) && cacheData) {
        try {
          const updatedData = updateFunction(cacheData);
          if (updatedData !== cacheData) {
            this.cache.set(cacheKey, updatedData);
            this.notifySubscribers(cacheKey, updatedData);
          }
        } catch (error) {
          // Ignore errors in related cache updates
        }
      }
    }
  }

  /**
   * Check if two cache types are related
   */
  areTypesRelated(type1, type2) {
    const relationships = {
      users: ['permissions', 'roles', 'memberships'],
      members: ['permissions', 'categories', 'memberships'],
      memberships: ['users', 'members'],
      permissions: ['users', 'members'],
      roles: ['users', 'permissions']
    };

    return (
      relationships[type1]?.includes(type2) ||
      relationships[type2]?.includes(type1)
    );
  }

  /**
   * Mark as loading
   */
  setLoading(type, params = {}, loading = true) {
    const key = this.generateCacheKey(type, params);
    this.loadingStates.set(key, loading);
  }

  /**
   * Check if currently loading
   */
  isLoading(type, params = {}) {
    const key = this.generateCacheKey(type, params);
    return this.loadingStates.get(key) || false;
  }

  /**
   * Subscribe to cache updates
   */
  subscribe(type, params = {}, callback) {
    const key = this.generateCacheKey(type, params);

    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    this.subscribers.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  /**
   * Notify subscribers of data updates
   */
  notifySubscribers(key, data) {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.warn('Error in cache subscriber callback:', error);
        }
      });
    }
  }

  /**
   * Invalidate cache for specific type
   */
  invalidate(type, params = {}) {
    const key = this.generateCacheKey(type, params);
    this.cache.delete(key);
    this.lastFetch.delete(key);
    this.loadingStates.delete(key);
  }

  /**
   * Invalidate all cache entries of a specific type
   */
  invalidateType(type) {
    const keysToDelete = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith(`${type}_`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.lastFetch.delete(key);
      this.loadingStates.delete(key);
    });
  }

  /**
   * Invalidate all cache entries with a specific prefix
   */
  invalidatePrefix(prefix) {
    const keysToDelete = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.lastFetch.delete(key);
      this.loadingStates.delete(key);
      this.accessOrder.delete(key);
    });

    // if (this.debugMode) {
    //   console.log(`🗑️ Invalidated ${keysToDelete.length} entries with prefix: ${prefix}`);
    // }

    return keysToDelete.length;
  }

  /**
   * Clear all cache
   */
  clearAll() {
    this.cache.clear();
    this.lastFetch.clear();
    this.loadingStates.clear();
    this.subscribers.clear();
  }

  /**
   * Preload data with request deduplication and retry logic
   */
  async preload(type, fetchFunction, params = {}) {
    const key = this.generateCacheKey(type, params);
    const cached = this.get(type, params);

    // If we have valid cached data, return it immediately
    if (cached.cached) {
      return cached.data;
    }

    // Check if request is already in flight (deduplication)
    if (this.pendingRequests.has(key)) {
      if (this.debugMode) {
        // console.log(`⏳ Request deduplication: ${key}`);
      }
      return this.pendingRequests.get(key);
    }

    // Create new request promise with retry logic
    const requestPromise = this._executeRequestWithRetry(
      type,
      fetchFunction,
      params,
      key
    );
    this.pendingRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Background refresh - updates cache without showing loading
   */
  async backgroundRefresh(type, fetchFunction, params = {}) {
    try {
      const data = await fetchFunction(params);
      this.set(type, data, params);
      return data;
    } catch (error) {
      console.warn(`Background refresh failed for ${type}:`, error);
      return null;
    }
  }

  /**
   * Bulk preload multiple data types
   */
  async bulkPreload(requests) {
    const promises = requests.map(({ type, fetchFunction, params = {} }) =>
      this.preload(type, fetchFunction, params).catch((error) => {
        console.warn(`Preload failed for ${type}:`, error);
        return null;
      })
    );

    return await Promise.all(promises);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const stats = {
      totalEntries: this.cache.size,
      loadingEntries: Array.from(this.loadingStates.values()).filter(Boolean)
        .length,
      subscribers: this.subscribers.size,
      entriesByType: {}
    };

    for (const key of this.cache.keys()) {
      const type = key.split('_')[0];
      stats.entriesByType[type] = (stats.entriesByType[type] || 0) + 1;
    }

    return stats;
  }

  /**
   * Performance tracking method
   */
  _recordCacheHit(key, isHit, error = null) {
    this.metrics.totalRequests++;

    if (error) {
      this.metrics.errors++;
    } else if (isHit) {
      this.metrics.hits++;
    } else {
      this.metrics.misses++;
    }

    this.metrics.cacheHitRate =
      this.metrics.totalRequests > 0
        ? (this.metrics.hits / this.metrics.totalRequests) * 100
        : 0;
  }

  /**
   * LRU eviction when cache size exceeds limit
   */
  _evictLRUIfNeeded() {
    if (this.cache.size <= this.maxCacheSize) return;

    // Find least recently used items
    const sortedByAccess = Array.from(this.accessOrder.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, Math.floor(this.maxCacheSize * 0.1)); // Remove 10% oldest

    sortedByAccess.forEach(([key]) => {
      this.cache.delete(key);
      this.lastFetch.delete(key);
      this.loadingStates.delete(key);
      this.accessOrder.delete(key);
    });

    if (this.debugMode) {
      console.log(`🗑️ LRU evicted ${sortedByAccess.length} entries`);
    }
  }

  /**
   * Execute request with retry logic and error handling
   */
  async _executeRequestWithRetry(
    type,
    fetchFunction,
    params,
    key,
    attempt = 0
  ) {
    this.setLoading(type, params, true);

    try {
      const startTime = Date.now();
      const data = await fetchFunction(params);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Record response time
      this.responseTimeHistory.push(responseTime);
      if (this.responseTimeHistory.length > 100) {
        this.responseTimeHistory.shift(); // Keep only last 100 measurements
      }

      // Update average response time
      this.metrics.averageResponseTime =
        this.responseTimeHistory.reduce((a, b) => a + b, 0) /
        this.responseTimeHistory.length;

      this.set(type, data, params);
      this.retryAttempts.delete(key);

      if (this.debugMode) {
        console.log(`✅ Request success: ${key} (${responseTime}ms)`);
      }

      return data;
    } catch (error) {
      if (attempt < this.maxRetries && this._shouldRetry(error)) {
        const retryDelay = this.baseRetryDelay * Math.pow(2, attempt);

        if (this.debugMode) {
          console.warn(
            `🔄 Retrying request: ${key} in ${retryDelay}ms. Attempt ${attempt + 1}/${this.maxRetries}`,
            error
          );
        }

        await this._delay(retryDelay);
        return this._executeRequestWithRetry(
          type,
          fetchFunction,
          params,
          key,
          attempt + 1
        );
      }

      this.setLoading(type, params, false);
      this.retryAttempts.delete(key);
      this._recordCacheHit(key, false, error);

      if (this.debugMode) {
        console.error(`❌ Request failed: ${key}`, error);
      }

      throw error;
    }
  }

  /**
   * Determine if error is retryable
   */
  _shouldRetry(error) {
    // Retry on network errors, 5xx errors, but not on 4xx errors
    if (!error.response) return true; // Network error
    return error.response.status >= 500;
  }

  /**
   * Utility delay function
   */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate unique session ID
   */
  _generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Cache persistence - hydrate from localStorage
   */
  _hydrateCacheFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.persistenceKey);
      if (!stored) return;

      const { cache, lastFetch, timestamp } = JSON.parse(stored);
      const now = Date.now();

      // Only hydrate if stored data is less than 1 hour old
      if (now - timestamp > 60 * 60 * 1000) {
        localStorage.removeItem(this.persistenceKey);
        return;
      }

      let hydratedCount = 0;

      // Restore only persistable cache types
      Object.entries(cache).forEach(([key, data]) => {
        const type = key.split('_')[0];
        if (this.persistableCacheTypes.includes(type)) {
          this.cache.set(key, data);
          this.lastFetch.set(key, lastFetch[key] || now);
          this.accessOrder.set(key, now);
          hydratedCount++;
        }
      });

      if (this.debugMode) {
        // console.log(`📚 Hydrated ${hydratedCount} cache entries from storage`);
      }
    } catch (error) {
      console.warn('Failed to hydrate cache from storage:', error);
      localStorage.removeItem(this.persistenceKey);
    }
  }

  /**
   * Setup auto-persistence with debouncing
   */
  _setupAutoPersistence() {
    this._persistDebounced = this._debounce(() => {
      this._persistCacheToStorage();
    }, 5000); // Persist 5 seconds after last change
  }

  /**
   * Persist cache to localStorage
   */
  _persistCacheToStorage() {
    if (typeof window === 'undefined') return;

    try {
      const persistableCache = {};
      const persistableLastFetch = {};
      let persistedCount = 0;

      this.cache.forEach((data, key) => {
        const type = key.split('_')[0];
        if (this.persistableCacheTypes.includes(type)) {
          persistableCache[key] = data;
          persistableLastFetch[key] = this.lastFetch.get(key);
          persistedCount++;
        }
      });

      const toStore = {
        cache: persistableCache,
        lastFetch: persistableLastFetch,
        timestamp: Date.now()
      };

      localStorage.setItem(this.persistenceKey, JSON.stringify(toStore));

      if (this.debugMode) {
        // console.log(`💾 Persisted ${persistedCount} cache entries to storage`);
      }
    } catch (error) {
      console.warn('Failed to persist cache to storage:', error);
    }
  }

  /**
   * Debounce utility function
   */
  _debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Start periodic cleanup process
   */
  _startPeriodicCleanup() {
    // Cleanup every 10 minutes
    this._cleanupInterval = setInterval(
      () => {
        const cleaned = this.cleanup();
        if (this.debugMode && cleaned > 0) {
          // console.log(`🧹 Periodic cleanup removed ${cleaned} expired entries`);
        }
      },
      10 * 60 * 1000
    );
  }

  /**
   * Track user behavior for predictive caching
   */
  trackUserAction(action, metadata = {}) {
    const timestamp = Date.now();
    const pattern = {
      action,
      metadata,
      timestamp,
      sessionId: this.sessionId
    };

    if (!this.userPatterns.has(action)) {
      this.userPatterns.set(action, []);
    }

    const patterns = this.userPatterns.get(action);
    patterns.push(pattern);

    // Keep only last 50 patterns per action
    if (patterns.length > 50) {
      patterns.shift();
    }

    // Trigger predictive warming
    this._predictAndWarm(action, metadata);
  }

  /**
   * Predict next actions and warm cache
   */
  _predictAndWarm(currentAction, metadata) {
    const predictions = this._getPredictiveActions(currentAction);

    predictions.forEach(({ action, confidence, data }) => {
      if (confidence > 0.3) {
        // Only warm if confidence > 30%
        this._queueForWarming(data);
      }
    });
  }

  /**
   * Get predictive actions based on user patterns
   */
  _getPredictiveActions(currentAction) {
    const predictions = [];

    // Analyze historical patterns
    this.userPatterns.forEach((patterns, action) => {
      if (action === currentAction) return;

      // Calculate how often this action follows the current action
      let followCount = 0;
      let totalCount = 0;

      patterns.forEach((pattern, index) => {
        totalCount++;
        if (index > 0 && patterns[index - 1].action === currentAction) {
          followCount++;
        }
      });

      const confidence = totalCount > 0 ? followCount / totalCount : 0;

      if (confidence > 0) {
        predictions.push({
          action,
          confidence,
          data: { type: action, fetchFunction: null, params: {} } // Placeholder
        });
      }
    });

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Queue item for cache warming
   */
  _queueForWarming(data) {
    this.warmingQueue.push(data);

    // Process queue in next tick
    setTimeout(() => {
      this._processWarmingQueue();
    }, 0);
  }

  /**
   * Process cache warming queue
   */
  async _processWarmingQueue() {
    if (this.isWarming || this.warmingQueue.length === 0) return;

    this.isWarming = true;

    while (this.warmingQueue.length > 0) {
      const { type, fetchFunction, params } = this.warmingQueue.shift();

      if (!fetchFunction) continue; // Skip if no fetch function provided

      try {
        await this.preload(type, fetchFunction, params);
        await this._delay(100); // Small delay to prevent overwhelming the server
      } catch (error) {
        // Silently fail warming requests
        if (this.debugMode) {
          console.warn(`Cache warming failed for ${type}:`, error);
        }
      }
    }

    this.isWarming = false;
  }

  /**
   * Get detailed performance statistics
   */
  getDetailedStats() {
    const avgResponseTime =
      this.responseTimeHistory.length > 0
        ? Math.round(
            this.responseTimeHistory.reduce((a, b) => a + b, 0) /
              this.responseTimeHistory.length
          )
        : 0;

    return {
      ...this.metrics,
      averageResponseTime: avgResponseTime,
      cacheSize: this.cache.size,
      loadingStates: this.loadingStates.size,
      subscribers: this.subscribers.size,
      pendingRequests: this.pendingRequests.size,
      memoryUsage: this._estimateMemoryUsage(),
      entriesByType: this._getEntriesByType(),
      oldestEntry: this._getOldestEntry(),
      newestEntry: this._getNewestEntry(),
      userPatterns: this.userPatterns.size,
      warmingQueueSize: this.warmingQueue.length
    };
  }

  /**
   * Estimate memory usage
   */
  _estimateMemoryUsage() {
    let totalSize = 0;
    this.cache.forEach((data) => {
      totalSize += JSON.stringify(data).length;
    });
    return Math.round(totalSize / 1024) + ' KB';
  }

  /**
   * Get entries grouped by type
   */
  _getEntriesByType() {
    const types = {};
    this.cache.forEach((_, key) => {
      const type = key.split('_')[0];
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  }

  /**
   * Get oldest cache entry
   */
  _getOldestEntry() {
    let oldest = null;
    let oldestTime = Date.now();

    this.lastFetch.forEach((time, key) => {
      if (time < oldestTime) {
        oldestTime = time;
        oldest = { key, age: Date.now() - time };
      }
    });

    return oldest;
  }

  /**
   * Get newest cache entry
   */
  _getNewestEntry() {
    let newest = null;
    let newestTime = 0;

    this.lastFetch.forEach((time, key) => {
      if (time > newestTime) {
        newestTime = time;
        newest = { key, age: Date.now() - time };
      }
    });

    return newest;
  }

  /**
   * Visualize cache state for debugging
   */
  visualizeCacheState() {
    const stats = this.getDetailedStats();
    console.group('🚀 Data Cache Manager Stats');
    // console.log('📊 Performance:', {
    //   'Hit Rate': `${stats.cacheHitRate.toFixed(2)}%`,
    //   'Avg Response Time': `${stats.averageResponseTime}ms`,
    //   'Total Requests': stats.totalRequests,
    //   Errors: stats.errors
    // });
    // console.log('💾 Memory:', {
    //   'Cache Size': stats.cacheSize,
    //   'Memory Usage': stats.memoryUsage,
    //   'Loading States': stats.loadingStates,
    //   'Pending Requests': stats.pendingRequests
    // });
    // console.log('📈 By Type:', stats.entriesByType);
    // console.log('🧠 Intelligence:', {
    //   'User Patterns': stats.userPatterns,
    //   'Warming Queue': stats.warmingQueueSize
    // });
    console.groupEnd();
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, timestamp] of this.lastFetch.entries()) {
      const cacheType = key.split('_')[0];
      const expiry = this.cacheExpiry[cacheType] || 5 * 60 * 1000;

      if (now - timestamp > expiry) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.lastFetch.delete(key);
      this.loadingStates.delete(key);
    });

    return keysToDelete.length;
  }
}

// Create global instance
const dataCache = new DataCacheManager();

// Expose for debugging with enhanced tools
if (typeof window !== 'undefined') {
  window.dataCache = dataCache;
  window.dataCacheStats = () => dataCache.visualizeCacheState();
  window.dataCacheDetails = () => dataCache.getDetailedStats();

  // Add cache performance monitor command
  window.dataCacheMonitor = () => {
    // console.log('📈 Starting cache performance monitor...');
    const interval = setInterval(() => {
      const stats = dataCache.getDetailedStats();
      // console.log(
      //   `Cache: ${stats.cacheHitRate.toFixed(1)}% hit rate, ${stats.averageResponseTime}ms avg response, ${stats.cacheSize} entries`
      // );
    }, 5000);

    return () => {
      clearInterval(interval);
      // console.log('📈 Cache performance monitor stopped');
    };
  };
}

export default dataCache;
