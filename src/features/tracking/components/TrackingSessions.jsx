'use client';

import { TrackingSessionsTable } from './TrackingSessionsTable';
import { trackingSessionsColumns } from './TrackingSessionsTableColumns';

// Error handling is now done in TrackingSessionsTable component
export default function TrackingSessions() {
  return (
    <TrackingSessionsTable columns={trackingSessionsColumns} />
  );
}
