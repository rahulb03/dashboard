import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import TrackingHealth from '@/features/tracking/components/TrackingHealth';

export const metadata = {
  title: 'Dashboard: System Health'
};

export default function TrackingHealthPage() {

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='System Health'
            description='Monitor tracking service health and performance metrics'
          />
        </div>
        <Separator />
        <TrackingHealth />
      </div>
    </PageContainer>
  );
}
