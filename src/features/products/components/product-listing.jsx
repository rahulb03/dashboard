import { ProductTable } from './product-tables';
import { columns } from './product-tables/columns';

export default function ProductListingPage() {
  return (
    <div className="space-y-4">
      <ProductTable columns={columns} />
    </div>
  );
}
