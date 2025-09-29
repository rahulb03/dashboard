'use client';

import { PaymentConfigTable } from './PaymentConfigTable';
import { columns } from './PaymentConfigTableColumns';

export default function PaymentConfigListingPage() {
  return <PaymentConfigTable columns={columns} />;
}