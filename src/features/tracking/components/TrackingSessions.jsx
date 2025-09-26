'use client';

import { TrackingSessionsTable } from './TrackingSessionsTable';
import { trackingSessionsColumns } from './TrackingSessionsTableColumns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useSelector } from 'react-redux';


export default function TrackingSessions() {
  const { sessionsError } = useSelector((state) => state.tracking);

  // Show error if there's a critical error
  if (sessionsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load tracking sessions: {sessionsError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <TrackingSessionsTable columns={trackingSessionsColumns} />
  );
}
