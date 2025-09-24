import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import DocumentsContent from '@/features/loan-management/components/documents-content';

export const metadata = {
  title: 'Dashboard: Loan Documents',
  description: 'View and manage all loan application documents.'
};

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Loan Documents'
            description='View and manage all documents associated with loan applications.'
          />
        </div>
        <Separator />
       
          <DocumentsContent />
      </div>
    </PageContainer>
  );
}
