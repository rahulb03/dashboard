import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import MembershipForm from '@/features/memberships/MembershipForm';

export const metadata = {
  title: 'Dashboard: Edit Membership'
};

export default function Page({ params }) {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <MembershipForm membershipId={params.id} mode="edit" />
        </Suspense>
      </div>
    </PageContainer>
  );
}