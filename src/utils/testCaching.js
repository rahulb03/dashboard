/**
 * Caching Test Utility
 * Use this to verify that caching is working properly
 * 
 * Open browser console and run:
 * window.testCaching()
 */

export const testCaching = () => {
  if (typeof window === 'undefined' || !window.dataCache) {
    console.error('❌ DataCache not available. Make sure you\'re in the browser.');
    return;
  }

  console.group('🧪 Cache Testing Results');
  
  // Test 1: Check cache status
  const stats = window.dataCache.getDetailedStats();
  console.log('📊 Cache Statistics:', {
    'Total Entries': stats.cacheSize,
    'Hit Rate': `${stats.cacheHitRate.toFixed(2)}%`,
    'Memory Usage': stats.memoryUsage,
    'Entries by Type': stats.entriesByType
  });

  // Test 2: Check specific cache entries
  console.log('🔍 Cache Contents:');
  console.log('Members Cache:', window.dataCache.cache.has('members_{}') ? '✅ Present' : '❌ Missing');
  console.log('Users Cache:', window.dataCache.cache.has('users_{}') ? '✅ Present' : '❌ Missing');
  console.log('Permissions Cache:', window.dataCache.cache.has('permissions_{}') ? '✅ Present' : '❌ Missing');

  // Test 3: Test cache validity
  const membersCacheValid = window.dataCache.isCacheValid('members_{}');
  const usersCacheValid = window.dataCache.isCacheValid('users_{}');
  const permissionsCacheValid = window.dataCache.isCacheValid('permissions_{}');

  console.log('⏰ Cache Validity:');
  console.log('Members:', membersCacheValid ? '✅ Valid' : '❌ Expired/Missing');
  console.log('Users:', usersCacheValid ? '✅ Valid' : '❌ Expired/Missing');
  console.log('Permissions:', permissionsCacheValid ? '✅ Valid' : '❌ Expired/Missing');

  // Test 4: Navigation instructions
  console.log('🧭 Navigation Test Instructions:');
  console.log('1. Navigate to Members page');
  console.log('2. Open Network tab in DevTools');
  console.log('3. Navigate to Permissions page');
  console.log('4. Navigate back to Members page');
  console.log('5. Check if API calls were made (should be minimal or none if caching works)');

  console.groupEnd();

  return {
    stats,
    cacheStatus: {
      members: membersCacheValid,
      users: usersCacheValid,
      permissions: permissionsCacheValid
    }
  };
};

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  window.testCaching = testCaching;
}

export default testCaching;