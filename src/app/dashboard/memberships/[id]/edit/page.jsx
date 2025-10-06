import PageContainer from '@/components/layout/page-container';
import MembershipForm from '@/features/memberships/MembershipForm';

export const metadata = {
  title: 'Dashboard: Edit Membership'
};

export default function Page({ params }) {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
          <MembershipForm membershipId={params.id} mode="edit" />
      </div>
    </PageContainer>
  );
}