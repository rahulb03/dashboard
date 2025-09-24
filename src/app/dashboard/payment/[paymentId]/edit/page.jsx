import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import PaymentForm from '@/features/payments/components/payment-form';

export const metadata = {
  title: 'Dashboard: Edit Payment Configuration'
};

export default async function EditPaymentPage(props) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
          <PaymentForm paymentId={params.paymentId} mode="edit" />
      </div>
    </PageContainer>
  );
}
