import PageContainer from '@/components/layout/page-container';
import MemberForm from '@/features/members/MemberForm';

export const metadata = {
  title: 'Dashboard: Edit Member'
};

export default async function EditMemberPage(props) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
          <MemberForm memberId={params.id} mode="edit" />
      </div>
    </PageContainer>
  );
}
