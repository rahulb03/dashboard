/**
 * Test utility to verify salary caching implementation
 * Run this in browser console after navigating to salary management page
 */

// Test the salary caching functionality
async function testSalaryCaching() {
  console.log('🧪 Testing Salary Caching Implementation...\n');
  
  // Get dataCache instance
  const dataCache = window.dataCache;
  if (!dataCache) {
    console.error('❌ DataCacheManager not found. Make sure you are on a page that loads it.');
    return;
  }
  
  // Clear any existing salary caches
  console.log('🧹 Clearing existing salary caches...');
  dataCache.invalidateType('salary');
  dataCache.invalidateType('salaries');
  dataCache.invalidateType('salariesByEmploymentType');
  dataCache.invalidateType('searchSalaries');
  
  // Test 1: Basic cache set and get
  console.log('\n📝 Test 1: Basic cache operations');
  const testSalary = { id: 1, employmentType: 'salaried', minSalary: 30000, loanAmount: 100000 };
  dataCache.set('salary', testSalary, { salaryId: 1 });
  
  const cached = dataCache.get('salary', { salaryId: 1 });
  console.log('Cache set/get test:', cached.cached ? '✅ PASSED' : '❌ FAILED');
  console.log('Cached data:', cached.data);
  
  // Test 2: Cache expiration
  console.log('\n⏰ Test 2: Cache expiration (simulated)');
  // Manually set lastFetch to old timestamp
  const cacheKey = dataCache.generateCacheKey('salary', { salaryId: 1 });
  dataCache.lastFetch.set(cacheKey, Date.now() - 10 * 60 * 1000); // 10 minutes ago
  
  const expiredCache = dataCache.get('salary', { salaryId: 1 });
  console.log('Cache expiration test:', !expiredCache.cached ? '✅ PASSED' : '❌ FAILED');
  
  // Test 3: Optimistic updates
  console.log('\n🚀 Test 3: Optimistic updates');
  const salariesList = [
    { id: 1, employmentType: 'salaried', minSalary: 30000 },
    { id: 2, employmentType: 'self-employed', minSalary: 50000 }
  ];
  dataCache.set('salaries', salariesList, {});
  
  // Test optimistic update
  dataCache.optimisticUpdate('salaries', (cachedSalaries) => {
    if (Array.isArray(cachedSalaries)) {
      return cachedSalaries.map(salary => 
        salary.id === 1 ? { ...salary, minSalary: 35000 } : salary
      );
    }
    return cachedSalaries;
  });
  
  const updatedCache = dataCache.get('salaries', {});
  const updatedSalary = updatedCache.data.find(s => s.id === 1);
  console.log('Optimistic update test:', updatedSalary.minSalary === 35000 ? '✅ PASSED' : '❌ FAILED');
  console.log('Updated salary:', updatedSalary);
  
  // Test 4: Cache invalidation
  console.log('\n🗑️ Test 4: Cache invalidation');
  dataCache.invalidate('salary', { salaryId: 1 });
  const invalidatedCache = dataCache.get('salary', { salaryId: 1 });
  console.log('Cache invalidation test:', !invalidatedCache.cached ? '✅ PASSED' : '❌ FAILED');
  
  // Test 5: Type-based invalidation
  console.log('\n🔄 Test 5: Type-based cache invalidation');
  dataCache.set('salariesByEmploymentType', { salaries: [], employmentType: 'salaried' }, { employmentType: 'salaried' });
  dataCache.set('searchSalaries', [], { query: 'test', employmentType: 'all' });
  
  // Invalidate all salary-related caches
  dataCache.invalidateType('salariesByEmploymentType');
  dataCache.invalidateType('searchSalaries');
  
  const employmentTypeCache = dataCache.get('salariesByEmploymentType', { employmentType: 'salaried' });
  const searchCache = dataCache.get('searchSalaries', { query: 'test', employmentType: 'all' });
  
  console.log('Type invalidation test:', 
    !employmentTypeCache.cached && !searchCache.cached ? '✅ PASSED' : '❌ FAILED'
  );
  
  // Display cache statistics
  console.log('\n📊 Cache Statistics:');
  const stats = dataCache.getDetailedStats();
  console.table({
    'Cache Entries': stats.cacheSize,
    'Hit Rate': `${stats.cacheHitRate.toFixed(2)}%`,
    'Memory Usage': stats.memoryUsage,
    'Avg Response Time': `${stats.averageResponseTime}ms`
  });
  
  console.log('\n📈 Entries by Type:');
  console.table(stats.entriesByType);
  
  console.log('\n🎉 Salary caching tests completed!');
  console.log('💡 You can run window.dataCacheStats() to see detailed cache statistics anytime.');
}

// Export for use
window.testSalaryCaching = testSalaryCaching;

// Auto-run if in development
if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
  console.log('💡 Run testSalaryCaching() in console to test the caching implementation');
}

export default testSalaryCaching;