import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import PermissionsManagement from '@/features/permissions/components/permissions-management';

export const metadata = {
  title: 'Dashboard: Permissions',
  description: 'Manage user permissions and access control.'
};

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Permission Management'
            description='Manage user permissions and access control.'
          />
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <PermissionsManagement />
        </Suspense>
      </div>
    </PageContainer>
  );
}
