import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import PaymentConfigListingPage from '@/features/payments/PaymentConfigListingPage';
import { searchParamsCache, serialize } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Payment Configurations'
};

export default async function Page(props) {
  const searchParams = await props.searchParams;
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Payment Configurations'
            description='Manage payment configurations, fees, and processing settings.'
          />
        </div>
        <Separator />
       
          <PaymentConfigListingPage />
      </div>
    </PageContainer>
  );
}