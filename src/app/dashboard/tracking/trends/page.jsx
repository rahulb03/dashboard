import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import TrackingTrends from '@/features/tracking/components/TrackingTrends';

export const metadata = {
  title: 'Dashboard: Performance Trends'
};

export default function TrackingTrendsPage() {
  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Performance Trends & Timeline'
            description='Track daily performance metrics and identify trends over time'
          />
        </div>
        <Separator />
        <TrackingTrends />
      </div>
    </PageContainer>
  );
}
