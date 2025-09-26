import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import TrackingSessions from '@/features/tracking/components/TrackingSessions';

export const metadata = {
  title: 'Dashboard: User Sessions'
};

export default function TrackingSessionsPage() {

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='User Sessions'
            description='Monitor and analyze individual user sessions'
          />
        </div>
        <Separator />
        <TrackingSessions />
      </div>
    </PageContainer>
  );
}
