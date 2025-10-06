import PageContainer from '@/components/layout/page-container';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import LoanApplicationViewPage from '@/features/loan-management/components/loan-application-view-page';

export const metadata = {
  title: 'View Loan Application',
  description: 'View detailed information about a loan application.'
};

export default function Page({ params }) {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4 overflow-x-auto">
       
          <LoanApplicationViewPage applicationId={params.id} mode="view" />
      </div>
    </PageContainer>
  );
}