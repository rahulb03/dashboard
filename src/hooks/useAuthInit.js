'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '@/redux/auth/authThunks';
import { setInitialized } from '@/redux/auth/authSlice';

export function useAuthInit() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading, initialized } = useSelector((state) => state.auth);
  const persistRehydrated = useSelector((state) => state._persist?.rehydrated);

  useEffect(() => {
    // Only run once after rehydration and if not already initialized
    if (!persistRehydrated || initialized) {
      return;
    }

    const initializeAuth = async () => {
      try {
        // With cookie-based auth, try to fetch profile on init
        // The cookie will be sent automatically with the request
        // If cookie is valid, we'll get user data back
        // If not valid, the API will return 401 and that's OK
        
        // Use a timeout to prevent hanging indefinitely
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        );
        
        await Promise.race([
          dispatch(getProfile({ forceRefresh: false })).unwrap(),
          timeoutPromise
        ]);
      } catch (error) {
        // User is not authenticated (no valid cookie) or request timed out
        // This is normal for logged-out users or slow network, so silent handling is fine
        console.log('Auth initialization:', error.message || 'Not authenticated');
      } finally {
        // Always mark as initialized to unblock the UI
        dispatch(setInitialized());
      }
    };

    initializeAuth();
  }, [dispatch, persistRehydrated, initialized]);

  return {
    isAuthenticated,
    user,
    loading,
    persistRehydrated
  };
}
