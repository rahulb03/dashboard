import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import MemberViewPage from '@/components/member/MemberViewPage';

export const metadata = {
  title: 'Dashboard: Member View'
};

export default async function Page(props) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
          <MemberViewPage memberId={params.id} />
      </div>
    </PageContainer>
  );
}
