import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import TrackingDashboard from '@/features/tracking/components/TrackingDashboard';

export const metadata = {
  title: 'Dashboard: Tracking Analytics'
};

export default function TrackingDashboardPage() {
  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Tracking Analytics'
            description='Monitor user flow performance and conversion metrics'
          />
        </div>
        <Separator />
        <TrackingDashboard />
      </div>
    </PageContainer>
  );
}
