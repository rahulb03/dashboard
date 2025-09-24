import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import PaymentViewPage from '@/features/payments/components/payment-view-page';

export const metadata = {
  title: 'Dashboard: Payment Configuration View'
};

export default async function Page(props) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
          <PaymentViewPage paymentId={params.paymentId} />
      </div>
    </PageContainer>
  );
}