'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { validateStoredAuth } from '@/lib/auth-utils';

// Loading component
function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div> */}
        {/* <p className="mt-4 text-sm text-muted-foreground">Loading...</p> */}
      </div>
    </div>
  );
}

// Routes that should be accessible without authentication
const publicRoutes = ['/', '/auth/sign-in', '/auth/sign-up', '/auth/forgot-password', '/auth/reset-password'];

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  
  // Get authentication state from Redux
  const reduxAuth = useSelector((state) => state.auth);
  const persistRehydrated = useSelector((state) => state._persist?.rehydrated);

  useEffect(() => {
    // Wait for Redux persist to rehydrate
    if (!persistRehydrated) {
      return;
    }

    const isRoutePublic = publicRoutes.some(route => {
      if (route === '/') return pathname === route;
      return pathname.startsWith(route);
    });

    // Get auth status from Redux or localStorage
    let isAuthenticated = false;
    
    if (reduxAuth.isAuthenticated && reduxAuth.user) {
      isAuthenticated = true;
    } else {
      // Check localStorage as fallback
      const localAuth = validateStoredAuth();
      isAuthenticated = localAuth.isAuthenticated;
    }

    // Handle navigation
    if (!isRoutePublic && !isAuthenticated) {
      // Protected route but not authenticated - redirect to login
      router.replace('/auth/sign-in');
    } else if (isRoutePublic && isAuthenticated && (pathname === '/' || pathname.startsWith('/auth'))) {
      // Public route but authenticated - redirect to dashboard
      router.replace('/dashboard/overview');
    } else {
      // All good, allow access
      setAuthChecked(true);
    }
  }, [persistRehydrated, pathname, reduxAuth.isAuthenticated, reduxAuth.user, router]);

  // Show loading until auth is checked
  if (!persistRehydrated || !authChecked) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}