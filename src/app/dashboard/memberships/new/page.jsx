import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import MembershipForm from '@/features/memberships/MembershipForm';

export const metadata = {
  title: 'Dashboard: Create Membership'
};

export default function Page() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
          <MembershipForm membershipId="new" mode="create" />
      </div>
    </PageContainer>
  );
}