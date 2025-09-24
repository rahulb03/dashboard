import PageContainer from '@/components/layout/page-container';
import SalaryForm from '@/features/salary/SalaryForm';

export const metadata = {
  title: 'Dashboard: View Salary Configuration'
};

export default async function Page(props) {
  const params = await props.params;
  return (
    <PageContainer scrollable={true}>
      <div className='flex-1 space-y-4'>
        <SalaryForm salaryId={params.id} mode="view" />
      </div>
    </PageContainer>
  );
}
