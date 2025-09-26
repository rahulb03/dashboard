import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import TrackingAnalytics from '@/features/tracking/components/TrackingAnalytics';

export const metadata = {
  title: 'Dashboard: Advanced Analytics'
};

export default function TrackingAnalyticsPage() {
  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Advanced Analytics'
            description='In-depth analysis of user flow patterns and conversion funnels'
          />
        </div>
        <Separator />
        <TrackingAnalytics />
      </div>
    </PageContainer>
  );
}
