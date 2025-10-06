import PageContainer from '@/components/layout/page-container';
import LoanApplicationViewPage from '@/features/loan-management/components/loan-application-view-page';

export const metadata = {
  title: 'Dashboard : Edit Loan Application'
};

export default async function Page(props) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
          <LoanApplicationViewPage applicationId={params.id} mode="edit" />
      </div>
    </PageContainer>
  );
}
