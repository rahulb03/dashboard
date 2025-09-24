import { PaymentTable } from './payment-tables';
import { columns } from './payment-tables/columns';

export default function PaymentListingPage() {
  return (
    <div className="space-y-4">
      <PaymentTable columns={columns} />
    </div>
  );
}