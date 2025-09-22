import React from 'react';
import { useCacheMonitor } from '../hooks/useDataCache';

/**
 * Cache Debugger Component
 * Shows cache performance metrics and debugging tools
 * Only renders in development mode
 */
const CacheDebugger = ({ position = 'bottom-right', minimized = false }) => {
  const {
    stats,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    refreshStats,
    visualizeCache,
    clearCache
  } = useCacheMonitor();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const [isMinimized, setIsMinimized] = React.useState(minimized);
  const [showDetails, setShowDetails] = React.useState(false);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const formatBytes = (bytes) => {
    return stats.memoryUsage || '0 KB';
  };

  const getPerformanceColor = (hitRate) => {
    if (hitRate >= 80) return 'text-green-600';
    if (hitRate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isMinimized) {
    return (
      <div 
        className={`fixed ${positionClasses[position]} z-50 bg-black bg-opacity-90 text-white rounded-lg p-2 cursor-pointer shadow-lg border border-gray-700`}
        onClick={() => setIsMinimized(false)}
        title="Click to expand cache debugger"
      >
        <div className="flex items-center space-x-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          <span>{stats.cacheHitRate.toFixed(1)}%</span>
          <span className="text-gray-400">|</span>
          <span>{stats.cacheSize}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 bg-black bg-opacity-95 text-white rounded-lg shadow-2xl border border-gray-700 min-w-80`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h3 className="font-semibold text-sm flex items-center">
          <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
          Cache Debugger
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
          >
            {showDetails ? 'Less' : 'More'}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-white w-4 h-4 flex items-center justify-center"
          >
            −
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400">Hit Rate</div>
            <div className={`font-semibold ${getPerformanceColor(stats.cacheHitRate)}`}>
              {stats.cacheHitRate.toFixed(2)}%
            </div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400">Avg Response</div>
            <div className="font-semibold text-blue-400">
              {stats.averageResponseTime}ms
            </div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400">Cache Size</div>
            <div className="font-semibold text-purple-400">
              {stats.cacheSize} entries
            </div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-gray-400">Memory</div>
            <div className="font-semibold text-orange-400">
              {formatBytes()}
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-2 pt-2 border-t border-gray-700">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Requests:</span>
                <span>{stats.totalRequests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cache Hits:</span>
                <span className="text-green-400">{stats.hits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cache Misses:</span>
                <span className="text-yellow-400">{stats.misses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Errors:</span>
                <span className="text-red-400">{stats.errors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pending:</span>
                <span className="text-blue-400">{stats.pendingRequests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User Patterns:</span>
                <span className="text-purple-400">{stats.userPatterns}</span>
              </div>
            </div>

            {/* Cache Types Breakdown */}
            {stats.entriesByType && Object.keys(stats.entriesByType).length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-gray-400 font-semibold">Cache by Type:</div>
                {Object.entries(stats.entriesByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-xs">
                    <span className="text-gray-300 capitalize">{type}:</span>
                    <span className="text-cyan-400">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-3 border-t border-gray-700 space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`text-xs px-2 py-1 rounded transition-colors flex-1 ${
              isMonitoring 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isMonitoring ? 'Stop Monitor' : 'Start Monitor'}
          </button>
          <button
            onClick={refreshStats}
            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex-1"
          >
            Refresh
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={visualizeCache}
            className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex-1"
          >
            Console Log
          </button>
          <button
            onClick={() => {
              if (window.confirm('Clear all cache?')) {
                clearCache();
              }
            }}
            className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex-1"
          >
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
};

export default CacheDebugger;