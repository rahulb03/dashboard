import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import LoanApplicationViewPage from '@/features/loan-management/components/loan-application-view-page';

export const metadata = {
  title: 'Dashboard : New Loan Application'
};

export default function Page() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <LoanApplicationViewPage applicationId="new" />
        </Suspense>
      </div>
    </PageContainer>
  );
}
