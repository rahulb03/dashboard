import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import FormCardSkeleton from '@/components/form-card-skeleton';
import MemberListingPage from '@/features/members/MemberListingPage';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Members'
};

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Members'
            description='Manage your organization members, roles, and permissions.'
          />
        </div>
        <Separator />
       
          <MemberListingPage />
      </div>
    </PageContainer>
  );
}
