import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import LoanManagement from '@/features/loan-management/components/loan-management';

export const metadata = {
  title: 'Dashboard: Loan Management',
  description: 'Manage loan applications, documents, and payments.'
};

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Loan Management'
            description='Manage loan applications, documents, and payments from a centralized dashboard.'
          />
        </div>
        <Separator />
        
          <LoanManagement />
      </div>
    </PageContainer>
  );
}