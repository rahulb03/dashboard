import PageContainer from '@/components/layout/page-container';
import LoanApplicationViewPage from '@/features/loan-management/components/loan-application-view-page';

export const metadata = {
  title: 'Dashboard : New Loan Application'
};

export default function Page() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
          <LoanApplicationViewPage applicationId="new" />
      </div>
    </PageContainer>
  );
}
