'use client';

import { PaymentTable } from './PaymentTable';
import { columns } from './PaymentTableColumns';

export default function PaymentListingPage() {
  return <PaymentTable columns={columns} />;
}
