import PageContainer from '@/components/layout/page-container';
import SalaryForm from '@/features/salary/SalaryForm';

export const metadata = {
  title: 'Dashboard: New Salary Configuration'
};

export default function Page() {
  return (
    <PageContainer scrollable={true}>
      <div className='flex-1 space-y-4'>
        <SalaryForm salaryId="new" mode="create" />
      </div>
    </PageContainer>
  );
}
