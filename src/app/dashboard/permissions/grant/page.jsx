import { Suspense } from 'react';
import GrantPermissionPage from '@/features/permissions/components/grant-permission-page';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

export const metadata = {
  title: 'Dashboard : Grant Permission',
  description: 'Grant permissions to users with detailed workflow.'
};

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex flex-col space-y-6 p-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
        <DataTableSkeleton columnCount={3} rowCount={5} />
      </div>
    }>
      <GrantPermissionPage />
    </Suspense>
  );
}
