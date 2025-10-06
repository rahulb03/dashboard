import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import MemberForm from '@/features/members/MemberForm';

export const metadata = {
  title: 'Dashboard: View Member'
};

export default async function ViewMemberPage(props) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
          <MemberForm memberId={params.id} mode="view" />
      </div>
    </PageContainer>
  );
}
