'use client';

import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getStoredAuthData, debugAuthState } from '@/lib/auth-utils';

export function AuthDebug() {
  const authState = useSelector(state => state.auth);
  const [localStorageData, setLocalStorageData] = useState(null);

  useEffect(() => {
    // Check localStorage data
    const checkStorage = () => {
      const stored = getStoredAuthData();
      setLocalStorageData(stored);
    };

    checkStorage();
    
    // Check every 5 seconds for debugging
    const interval = setInterval(checkStorage, 5000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white text-xs rounded-lg max-w-sm z-50">
      <div className="font-bold mb-2">Auth Debug Info:</div>
      
      <div className="mb-2">
        <div className="font-semibold">Redux State:</div>
        <div>Authenticated: {authState.isAuthenticated ? '✅' : '❌'}</div>
        <div>User: {authState.user?.name || 'None'}</div>
        <div>Token: {authState.token ? '✅' : '❌'}</div>
        <div>Loading: {authState.loading ? '⏳' : '✅'}</div>
        <div>Rehydrated: {authState._persist?.rehydrated ? '✅' : '❌'}</div>
      </div>

      <div className="mb-2">
        <div className="font-semibold">LocalStorage:</div>
        <div>Has Data: {localStorageData ? '✅' : '❌'}</div>
        {localStorageData && (
          <div>User: {localStorageData.user?.name || 'Unknown'}</div>
        )}
      </div>

      <button 
        onClick={debugAuthState}
        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
      >
        Debug Log
      </button>
    </div>
  );
}