'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

export default function Page() {
  const router = useRouter();
  const { isAuthenticated, user, initialized } = useSelector((state) => state.auth);
  const persistRehydrated = useSelector((state) => state._persist?.rehydrated);

  useEffect(() => {
    // Wait for auth to initialize
    if (!persistRehydrated || !initialized) {
      return;
    }

    // Redirect based on auth status
    if (isAuthenticated && user) {
      router.replace('/dashboard/overview');
    } else {
      router.replace('/auth/sign-in');
    }
  }, [persistRehydrated, initialized, isAuthenticated, user, router]);

  // Show nothing while redirecting (prevent flash)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
