'use client';

import { PRODUCTS_DATA } from '@/constants/products-data';

export default function DebugPage() {
  const products = PRODUCTS_DATA;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Product Debug Page</h1>
      <div className="mb-4">
        <p>Total products loaded: {products.length}</p>
      </div>
      
      {products.length === 0 ? (
        <div className="text-red-500">No products found!</div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="border p-4 rounded">
              <h3 className="font-bold">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.category}</p>
              <p className="text-sm">${product.price}</p>
              <p className="text-xs text-gray-500">{product.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
