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
        // With cookie-based auth, ALWAYS fetch profile on init
        // The cookie will be sent automatically with the request
        // If cookie is valid, we'll get user data back
        // If not valid, the API will return 401 and that's OK
        await dispatch(getProfile()).unwrap();
      } catch (error) {
        // User is not authenticated (no valid cookie)
        // This is normal for logged-out users, so silent handling is fine
      } finally {
        // Always mark as initialized
        dispatch(setInitialized());
      }
    };

    initializeAuth();
  }, [dispatch, persistRehydrated, initialized, isAuthenticated, user]);

  return {
    isAuthenticated,
    user,
    loading,
    persistRehydrated
  };
}
