'use client';

export function SimpleProductList({ data = [], totalItems = 0 }) {
  console.log('SimpleProductList received:', { dataLength: data.length, totalItems });
  
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="p-8 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
        <p className="text-muted-foreground">
          No product data available. Data received: {JSON.stringify(data)}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Total items prop: {totalItems}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Showing {data.length} of {totalItems} products
      </div>
      
      <div className="grid gap-4">
        {data.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">IMG</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{product.name || 'Unnamed Product'}</h3>
                <p className="text-sm text-muted-foreground">
                  {product.category || 'No category'} • ${product.price?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {product.description || 'No description'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}