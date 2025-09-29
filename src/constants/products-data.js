// Products data array - direct data access, no mock API needed
export const PRODUCTS_DATA = [
  { id: 1, name: 'iPhone 15 Pro', description: 'Latest Apple smartphone with pro camera system', price: 999.99, photo_url: '/placeholder-product.svg', category: 'Electronics', created_at: '2023-01-15T10:00:00.000Z', updated_at: '2023-12-01T10:00:00.000Z' },
  { id: 2, name: 'MacBook Air M2', description: 'Lightweight laptop with M2 chip', price: 1199.99, photo_url: '/placeholder-product.svg', category: 'Electronics', created_at: '2023-02-10T10:00:00.000Z', updated_at: '2023-12-01T10:00:00.000Z' },
  { id: 3, name: 'Ergonomic Office Chair', description: 'Comfortable office chair with lumbar support', price: 299.99, photo_url: '/placeholder-product.svg', category: 'Furniture', created_at: '2023-03-05T10:00:00.000Z', updated_at: '2023-12-01T10:00:00.000Z' },
  { id: 4, name: 'Standing Desk', description: 'Adjustable height standing desk', price: 449.99, photo_url: '/placeholder-product.svg', category: 'Furniture', created_at: '2023-04-20T10:00:00.000Z', updated_at: '2023-12-01T10:00:00.000Z' },
  { id: 5, name: 'Nike Air Max', description: 'Premium running shoes', price: 129.99, photo_url: '/placeholder-product.svg', category: 'Clothing', created_at: '2023-05-15T10:00:00.000Z', updated_at: '2023-12-01T10:00:00.000Z' },
  { id: 6, name: 'Levi\'s Jeans', description: '501 original fit jeans', price: 89.99, photo_url: '/placeholder-product.svg', category: 'Clothing', created_at: '2023-06-10T10:00:00.000Z', updated_at: '2023-12-01T10:00:00.000Z' },
  { id: 7, name: 'LEGO Creator Set', description: 'Advanced building set for adults', price: 199.99, photo_url: '/placeholder-product.svg', category: 'Toys', created_at: '2023-07-05T10:00:00.000Z', updated_at: '2023-12-01T10:00:00.000Z' },
  { id: 8, name: 'Board Game Collection', description: 'Strategy board games bundle', price: 79.99, photo_url: '/placeholder-product.svg', category: 'Toys', created_at: '2023-08-01T10:00:00.000Z', updated_at: '2023-12-01T10:00:00.000Z' },
  { id: 9, name: 'Organic Coffee Beans', description: 'Premium dark roast coffee', price: 24.99, photo_url: '/placeholder-product.svg', category: 'Groceries', created_at: '2023-09-10T10:00:00.000Z', updated_at: '2023-12-01T10:00:00.000Z' },
  { id: 10, name: 'Green Tea Set', description: 'Organic green tea collection', price: 39.99, photo_url: '/placeholder-product.svg', category: 'Groceries', created_at: '2023-10-05T10:00:00.000Z', updated_at: '2023-12-01T10:00:00.000Z' },
  { id: 11, name: 'Programming Books', description: 'Complete JavaScript guide', price: 49.99, photo_url: '/placeholder-product.svg', category: 'Books', created_at: '2023-11-01T10:00:00.000Z', updated_at: '2023-12-01T10:00:00.000Z' },
  { id: 12, name: 'Design Patterns Book', description: 'Software architecture patterns', price: 59.99, photo_url: '/placeholder-product.svg', category: 'Books', created_at: '2023-11-15T10:00:00.000Z', updated_at: '2023-12-01T10:00:00.000Z' }
];

// Helper function to filter products by category
export const getProductsByCategory = (category) => {
  if (!category) return PRODUCTS_DATA;
  return PRODUCTS_DATA.filter(product => product.category === category);
};

// Helper function to search products
export const searchProducts = (query) => {
  if (!query) return PRODUCTS_DATA;
  const lowerQuery = query.toLowerCase();
  return PRODUCTS_DATA.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery)
  );
};

// Helper function to get product by ID
export const getProductById = (id) => {
  return PRODUCTS_DATA.find(product => product.id === parseInt(id));
};

// Get all unique categories
export const getProductCategories = () => {
  return [...new Set(PRODUCTS_DATA.map(product => product.category))];
};