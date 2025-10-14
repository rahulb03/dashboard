# Caching and Data Freshness Fixes

## Overview
This document outlines the changes made to ensure fresh data fetching in the admin dashboard and fix the session export issue.

## Issues Addressed

### 1. **Stale Cache After Data Deletion**
**Problem**: When data (memberships, payments, etc.) was deleted from the database, the admin dashboard continued showing the deleted data due to caching.

**Solution**: Implemented multiple layers of cache management:

#### A. Reduced Cache TTL for Admin-Critical Data
Updated `DataCacheManager.js` cache expiry times:
- **Memberships**: 1 minute (down from 3-5 minutes)
- **Payments**: 1 minute (down from 2-3 minutes)
- **Search Results**: 30 seconds (very short for real-time feel)
- **Users/Members**: 2 minutes (down from 5 minutes)
- **Membership Stats**: 2 minutes (updates after deletions)

**Benefits**:
- Data automatically refreshes within 1-2 minutes
- Deleted items disappear quickly from the UI
- Search results always feel fresh

#### B. Force Refresh Support
All Redux thunks already support `forceRefresh` parameter:
```javascript
dispatch(fetchMembershipsThunk({ forceRefresh: true }))
dispatch(fetchPaymentsThunk({ forceRefresh: true }))
```

#### C. Automatic Cache Invalidation
The thunks automatically invalidate related caches on mutations:
- **Delete**: Removes from cache + optimistic update of lists
- **Update**: Updates individual item + list caches
- **Create**: Adds to cache + optimistic update of lists

Example from `membershipThunks.js`:
```javascript
// On delete
dataCache.invalidate('membership', { membershipId });
dataCache.invalidatePrefix('membershipStats');
```

### 2. **Session Export "totalDuration" Error**
**Problem**: Export failed with error: `Column with id 'totalDuration' does not exist`

**Root Cause**: Session data from API may not include `totalDuration` field consistently.

**Solution**: Implemented multi-source duration calculation with fallbacks:

#### A. Export Function (`trackingThunks.js`)
```javascript
// Try multiple sources for duration
let duration = session.totalDuration || session.duration || '';
if (!duration && session.startedAt && session.completedAt) {
  const start = new Date(session.startedAt).getTime();
  const end = new Date(session.completedAt).getTime();
  duration = Math.floor((end - start) / 1000);
}
```

#### B. Table Column (`TrackingSessionsTableColumns.jsx`)
Updated accessor to try multiple sources:
1. `row.totalDuration`
2. `row.duration`
3. Calculate from `startedAt` and `completedAt`
4. Return `null` if all fail (displays as "-")

#### C. Individual Session Export
Same fallback logic applied to single-session export.

## Best Practices Implemented

### 1. **Cache Management**
```javascript
// Always use forceRefresh when user explicitly requests fresh data
const handleRefresh = () => {
  dispatch(fetchDataThunk({ forceRefresh: true }));
};
```

### 2. **Data Mutations**
After any delete/update operation:
```javascript
// Invalidate related caches
dataCache.invalidate(type, params);
dataCache.invalidatePrefix('relatedType');
```

### 3. **Error Handling**
Always provide fallbacks for missing data:
```javascript
const value = data?.field || fallback || 'N/A';
```

## Testing Recommendations

### Test Cache Freshness
1. **Delete a membership/payment**
2. **Wait 1-2 minutes** (automatic cache expiry)
3. **Verify item disappears** from dashboard
4. **Or click Refresh** for immediate update

### Test Force Refresh
1. **Open payments/memberships page**
2. **Click Refresh button**
3. **Verify forceRefresh: true** is passed to thunk
4. **Confirm fresh data loads**

### Test Session Export
1. **Navigate to tracking sessions**
2. **Click Export button**
3. **Verify CSV downloads** without errors
4. **Check duration column** has values (even if "0")
5. **Test with sessions** that have/don't have `totalDuration`

## Future Improvements

### Real-Time Updates
Consider implementing WebSocket or polling for ultra-real-time updates:
```javascript
// Example: Poll for updates every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    dispatch(fetchDataThunk({ forceRefresh: true }));
  }, 30000);
  return () => clearInterval(interval);
}, []);
```

### Optimistic UI
Already implemented! The cache manager uses optimistic updates:
```javascript
dataCache.optimisticUpdate('memberships', (cached) => {
  // Update UI immediately, sync with server in background
});
```

### Cache Invalidation on Navigation
Consider adding cache invalidation when navigating away:
```javascript
useEffect(() => {
  return () => {
    // Invalidate on unmount
    dataCache.invalidateType('currentDataType');
  };
}, []);
```

## Configuration Reference

### Cache Expiry Times (in DataCacheManager.js)
```javascript
cacheExpiry: {
  // Admin Dashboard (Short TTLs)
  memberships: 1 * 60 * 1000,      // 1 minute
  payments: 1 * 60 * 1000,          // 1 minute
  users: 2 * 60 * 1000,             // 2 minutes
  members: 2 * 60 * 1000,           // 2 minutes
  
  // Search (Very Short TTLs)
  searchMemberships: 30 * 1000,     // 30 seconds
  searchPayments: 30 * 1000,        // 30 seconds
  
  // Statistics (Medium TTLs)
  membershipStats: 2 * 60 * 1000,   // 2 minutes
  
  // Configuration (Longer TTLs)
  settings: 30 * 60 * 1000,         // 30 minutes
}
```

## Summary of Changes

### Files Modified
1. ✅ `src/utils/DataCacheManager.js` - Reduced cache TTLs
2. ✅ `src/redux/tracking/trackingThunks.js` - Fixed export duration handling
3. ✅ `src/features/tracking/components/TrackingSessionsTableColumns.jsx` - Fixed duration column & export
4. ✅ All thunks already support `forceRefresh` parameter

### Key Improvements
- ✅ **1-minute cache** for payments and memberships
- ✅ **30-second cache** for search results
- ✅ **Automatic cache expiration** ensures freshness
- ✅ **Force refresh capability** for immediate updates
- ✅ **Automatic cache invalidation** on mutations
- ✅ **Robust duration calculation** with multiple fallbacks
- ✅ **Export now handles missing fields** gracefully

## Conclusion

The admin dashboard now provides **near-real-time data** with:
- Automatic refresh every 1-2 minutes
- Manual refresh capability
- Proper cache invalidation on deletions
- Robust error handling for missing data

Deleted data will disappear from the dashboard within 1 minute automatically, or immediately upon clicking the Refresh button.
