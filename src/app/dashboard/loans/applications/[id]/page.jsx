import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import LoanApplicationViewPage from '@/features/loan-management/components/loan-application-view-page';

export const metadata = {
  title: 'Dashboard : Loan Application View'
};

export default async function Page(props) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <LoanApplicationViewPage applicationId={params.id} mode="edit" />
        </Suspense>
      </div>
    </PageContainer>
  );
}