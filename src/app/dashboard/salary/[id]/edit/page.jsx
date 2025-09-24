import PageContainer from '@/components/layout/page-container';
import SalaryForm from '@/features/salary/SalaryForm';

export const metadata = {
  title: 'Dashboard: Edit Salary Configuration'
};

export default function Page({ params }) {
  return (
    <PageContainer scrollable={true}>
      <div className='flex-1 space-y-4'>
        <SalaryForm salaryId={params.id} mode="edit" />
      </div>
    </PageContainer>
  );
}
