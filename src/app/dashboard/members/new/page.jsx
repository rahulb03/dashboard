import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import MemberForm from '@/features/members/MemberForm';

export const metadata = {
  title: 'Dashboard: Create Member'
};

export default function Page() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
          <MemberForm memberId="new" mode="create" />
      </div>
    </PageContainer>
  );
}
