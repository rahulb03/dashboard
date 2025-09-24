'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '@/redux/auth/authThunks';
import { setInitialized } from '@/redux/auth/authSlice';
import { validateStoredAuth, debugAuthState } from '@/lib/auth-utils';

export function useAuthInit() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token, loading, initialized } = useSelector((state) => state.auth);
  const persistRehydrated = useSelector((state) => state._persist?.rehydrated);

  useEffect(() => {
    // Only run once after rehydration and if not already initialized
    if (!persistRehydrated || initialized) {
      return;
    }


    const initializeAuth = async () => {
      try {
        // Check localStorage for valid auth data
        const localStorageAuth = validateStoredAuth();
        
        if (localStorageAuth.isAuthenticated && !isAuthenticated) {
          await dispatch(getProfile());
        }
      } catch (error) {
        // Silent error handling
      } finally {
        // Always mark as initialized
        dispatch(setInitialized());
      }
    };

    initializeAuth();
  }, [dispatch, persistRehydrated, initialized]); // Simplified dependencies

  return {
    isAuthenticated,
    user,
    loading,
    persistRehydrated
  };
}