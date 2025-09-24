import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import SalaryListingPage from '@/features/salary/SalaryListingPage';
import { Suspense } from 'react';
import FormCardSkeleton from '@/components/form-card-skeleton';

export const metadata = {
  title: 'Dashboard: Salary Configurations'
};

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Salary Configurations'
            description='Manage loan eligibility configurations based on salary and CIBIL scores.'
          />
        </div>
        <Separator />
       
        <Suspense fallback={<FormCardSkeleton />}>
          <SalaryListingPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
