import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import LoanApplicationsContent from '@/features/loan-management/components/loan-applications-content';
import cn from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard: Loan Applications',
  description: 'View and manage all loan applications.'
};

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Loan Applications'
            description='View and manage all loan applications in the system.'
          />
         
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={8} rowCount={10} filterCount={3} />
          }
        >
          <LoanApplicationsContent />
        </Suspense>
      </div>
    </PageContainer>
  );
}
