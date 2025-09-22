'use client';

import { useState, useEffect } from 'react';
import { fakeProducts } from '@/constants/mock-api';

export default function DebugPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function testProducts() {
      try {
        console.log('Testing product generation...');
        
        // Force initialization
        console.log('Records before init:', fakeProducts.records.length);
        fakeProducts.initialize();
        console.log('Records after init:', fakeProducts.records.length);
        
        if (fakeProducts.records.length > 0) {
          console.log('Sample product:', fakeProducts.records[0]);
        }
        
        // Test getProducts
        const result = await fakeProducts.getProducts({});
        console.log('getProducts result:', result);
        
        setProducts(result.products || []);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    testProducts();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Product Debug Page</h1>
      <div className="mb-4">
        <p>Total products loaded: {products.length}</p>
        <p>Records in memory: {fakeProducts.records.length}</p>
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