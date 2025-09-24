import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import PaymentsContent from '@/features/loan-management/components/payments-content';

export const metadata = {
  title: 'Dashboard: Loan Payments',
  description: 'View and manage all loan payments and transactions.'
};

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Loan Payments'
            description='View and manage all loan payments and transactions.'
          />
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={10} filterCount={2} />
          }
        >
          <PaymentsContent />
        </Suspense>
      </div>
    </PageContainer>
  );
}
