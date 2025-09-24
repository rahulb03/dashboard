'use client';

import { Suspense } from 'react';
import { SalaryTable } from './SalaryTable';
import { salaryColumns } from './salary-table-columns';
import FormCardSkeleton from '@/components/form-card-skeleton';

function SalaryTableWrapper() {
  return <SalaryTable columns={salaryColumns} />;
}

export default function SalaryListingPage() {
  return (
    <Suspense fallback={<FormCardSkeleton />}>
      <SalaryTableWrapper />
    </Suspense>
  );
}
