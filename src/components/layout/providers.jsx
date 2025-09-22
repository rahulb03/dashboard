'use client';
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/redux/store';
import { ActiveThemeProvider } from '../active-theme';
import { AuthProvider } from '@/lib/auth';

// Loading component for PersistGate
function PersistLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
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
            {children}
          </AuthProvider>
        </ActiveThemeProvider>
      </PersistGate>
    </Provider>
  );
}
