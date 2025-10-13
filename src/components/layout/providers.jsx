'use client';
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/redux/store';
import { ActiveThemeProvider } from '../active-theme';
import { AuthProvider } from '@/lib/auth';
import AuthGuard from '../auth/auth-guard';
import { usePathname } from 'next/navigation';

// Loading component for PersistGate
function PersistLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Wrapper to conditionally apply AuthGuard
function ConditionalAuthGuard({ children }) {
  const pathname = usePathname();
  
  // Public routes that don't need AuthGuard
  const publicRoutes = ['/', '/auth/sign-in', '/auth/sign-up', '/auth/forgot-password', '/auth/reset-password'];
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') return pathname === route;
    return pathname.startsWith(route);
  });
  
  // Skip AuthGuard for public routes to prevent flash
  if (isPublicRoute) {
    return <>{children}</>;
  }
  
  // Apply AuthGuard for protected routes (dashboard, etc.)
  return <AuthGuard>{children}</AuthGuard>;
}

export default function Providers({
  activeThemeValue,
  children
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={<PersistLoading />} persistor={persistor}>
        <ActiveThemeProvider initialTheme={activeThemeValue}>
          <AuthProvider>
            <ConditionalAuthGuard>
              {children}
            </ConditionalAuthGuard>
          </AuthProvider>
        </ActiveThemeProvider>
      </PersistGate>
    </Provider>
  );
}
