'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function TrackingPage() {
  useEffect(() => {
    // Redirect to dashboard by default
    redirect('/dashboard/tracking/dashboard');
  }, []);

  return null;
}