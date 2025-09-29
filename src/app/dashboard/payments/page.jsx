import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import FormCardSkeleton from '@/components/form-card-skeleton';
import PaymentListingPage from '@/features/payments/PaymentListingPage';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Payments'
};

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Payments'
            description='Manage and monitor all payment transactions.'
          />
        </div>
        <Separator />
       
          <PaymentListingPage />
      </div>
    </PageContainer>
  );
}
