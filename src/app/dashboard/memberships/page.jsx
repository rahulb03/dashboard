import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import FormCardSkeleton from '@/components/form-card-skeleton';
import MembershipListingPage from '@/features/memberships/MembershipListingPage';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Memberships'
};

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Memberships'
            description='Manage user memberships, subscriptions, and membership status.'
          />
        </div>
        <Separator />
       
          <MembershipListingPage />
      </div>
    </PageContainer>
  );
}