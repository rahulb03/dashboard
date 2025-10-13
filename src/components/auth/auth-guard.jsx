'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { validateStoredAuth, isValidAdminRole, clearStoredAuthData } from '@/lib/auth-utils';
import { toast } from 'sonner';

// Loading component
function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">Loading your session...</p>
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
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Get authentication state from Redux
  const reduxAuth = useSelector((state) => state.auth);
  const persistRehydrated = useSelector((state) => state._persist?.rehydrated);

  // Check if current route is public
  const isRoutePublic = publicRoutes.some(route => {
    if (route === '/') return pathname === route;
    return pathname.startsWith(route);
  });

  useEffect(() => {
    // Wait for Redux persist to rehydrate AND auth initialization
    if (!persistRehydrated || !reduxAuth.initialized) {
      return;
    }

    // Get auth status from Redux (cookies are validated by API)
    const isAuthenticated = reduxAuth.isAuthenticated && reduxAuth.user;
    const userRole = reduxAuth.user?.role;
    
    // Validate role if authenticated and not on public route
    if (isAuthenticated && !isRoutePublic) {
      if (!isValidAdminRole(userRole)) {
        // Invalid role detected, clear auth and redirect
        clearStoredAuthData();
        toast.error('Access denied. Only ADMIN, MANAGER, and EMPLOYEE roles can access this dashboard.');
        setIsRedirecting(true);
        router.replace('/auth/sign-in');
        return;
      }
    }

    // Handle navigation
    if (!isRoutePublic && !isAuthenticated) {
      // Protected route but not authenticated - redirect to login
      setIsRedirecting(true);
      router.replace('/auth/sign-in');
    } else if (isRoutePublic && isAuthenticated && (pathname === '/' || pathname.startsWith('/auth'))) {
      // Public route but authenticated - redirect to dashboard
      setIsRedirecting(true);
      router.replace('/dashboard/overview');
    } else {
      // All good, allow access
      setAuthChecked(true);
    }
  }, [persistRehydrated, reduxAuth.initialized, pathname, reduxAuth.isAuthenticated, reduxAuth.user, router, isRoutePublic]);

  // For public routes, show content as soon as persist is rehydrated (don't wait for auth init)
  if (isRoutePublic) {
    // If already initialized and redirecting, show loading
    if (persistRehydrated && reduxAuth.initialized && isRedirecting) {
      return <AuthLoading />;
    }
    // Otherwise show the public page immediately
    if (persistRehydrated) {
      return <>{children}</>;
    }
    // Only show loading while rehydrating
    return <AuthLoading />;
  }

  // For protected routes, show loading until auth is initialized and checked
  if (!persistRehydrated || !reduxAuth.initialized || !authChecked) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}
