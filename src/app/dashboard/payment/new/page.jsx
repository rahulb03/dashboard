import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import PaymentForm from '@/features/payments/components/payment-form';

export const metadata = {
  title: 'Dashboard: New Payment Configuration'
};

export default function NewPaymentPage() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
          <PaymentForm paymentId="new" mode="create" />
      </div>
    </PageContainer>
  );
}
