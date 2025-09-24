////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
////////////////////////////////////////////////////////////////////////////////

import { faker } from '@faker-js/faker';
import { matchSorter } from 'match-sorter'; // For filtering

export const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Define the shape of Product data

// Mock product data store
// Simple dummy data - no faker dependency
const DUMMY_PRODUCTS = [
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

export const fakeProducts = {
  records: [...DUMMY_PRODUCTS], // Copy the dummy data

  initialize() {
    this.records = [...DUMMY_PRODUCTS];
    console.log('Initialized with dummy products:', this.records.length);
  },

  // Get all products with optional category filtering and search
  async getAll({
    categories = [],
    search
  }) {
    let products = [...this.records];

    // Filter products based on selected categories
    if (categories.length > 0) {
      products = products.filter((product) =>
        categories.includes(product.category)
      );
    }

    // Search functionality across multiple fields
    if (search) {
      products = matchSorter(products, search, {
        keys: ['name', 'description', 'category']
      });
    }

    return products;
  },

  // Get paginated results with optional category filtering and search
  async getProducts({
    page = 1,
    limit = 10,
    categories,
    search
  }) {
    await delay(1000);
    
    // Ensure we have products initialized
    if (this.records.length === 0) {
      this.initialize();
    }
    
    const categoriesArray = categories ? categories.split('.') : [];
    const allProducts = await this.getAll({
      categories: categoriesArray,
      search
    });
    const totalProducts = allProducts.length;

    // Pagination logic
    const offset = (page - 1) * limit;
    const paginatedProducts = allProducts.slice(offset, offset + limit);

    // Mock current time
    const currentTime = new Date().toISOString();

    // Return paginated response
    return {
      success: true,
      time: currentTime,
      message: 'Sample data for testing and learning purposes',
      total_products: totalProducts,
      offset,
      limit,
      products: paginatedProducts
    };
  },

  // Get a specific product by its ID
  async getProductById(id) {
    await delay(1000); // Simulate a delay

    // Find the product by its ID
    const product = this.records.find((product) => product.id === id);

    if (!product) {
      return {
        success: false,
        message: `Product with ID ${id} not found`
      };
    }

    // Mock current time
    const currentTime = new Date().toISOString();

    return {
      success: true,
      time: currentTime,
      message: `Product with ID ${id} found`,
      product
    };
  }
};

// Initialize sample products
fakeProducts.initialize();

// Payment mock data
const DUMMY_PAYMENTS = [
  { id: 1, type: 'LOAN_FEE', amount: 50.00, description: 'Standard loan processing fee', isActive: true, metadata: {}, createdAt: '2023-01-15T10:00:00.000Z', updatedAt: '2023-12-01T10:00:00.000Z' },
  { id: 2, type: 'MEMBERSHIP', amount: 29.99, description: 'Monthly membership fee for premium services', isActive: true, metadata: { planType: 'monthly' }, createdAt: '2023-02-10T10:00:00.000Z', updatedAt: '2023-12-01T10:00:00.000Z' },
  { id: 3, type: 'DOCUMENT_FEE', amount: 15.00, description: 'Document verification and processing fee', isActive: true, metadata: {}, createdAt: '2023-03-05T10:00:00.000Z', updatedAt: '2023-12-01T10:00:00.000Z' },
  { id: 4, type: 'MEMBERSHIP', amount: 299.99, description: 'Annual membership fee with premium benefits', isActive: false, metadata: { planType: 'yearly' }, createdAt: '2023-04-20T10:00:00.000Z', updatedAt: '2023-12-01T10:00:00.000Z' },
  { id: 5, type: 'LOAN_FEE', amount: 25.00, description: 'Express loan processing with priority handling', isActive: true, metadata: {}, createdAt: '2023-05-15T10:00:00.000Z', updatedAt: '2023-12-01T10:00:00.000Z' },
  { id: 6, type: 'DOCUMENT_FEE', amount: 10.00, description: 'Basic document scanning and digital storage', isActive: false, metadata: {}, createdAt: '2023-06-10T10:00:00.000Z', updatedAt: '2023-12-01T10:00:00.000Z' },
  { id: 7, type: 'MEMBERSHIP', amount: 49.99, description: 'Premium membership with extended features', isActive: true, metadata: { planType: 'monthly' }, createdAt: '2023-07-05T10:00:00.000Z', updatedAt: '2023-12-01T10:00:00.000Z' },
  { id: 8, type: 'LOAN_FEE', amount: 75.00, description: 'Large loan application processing fee', isActive: true, metadata: {}, createdAt: '2023-08-01T10:00:00.000Z', updatedAt: '2023-12-01T10:00:00.000Z' },
  { id: 9, type: 'DOCUMENT_FEE', amount: 20.00, description: 'Premium document processing with expedited service', isActive: true, metadata: {}, createdAt: '2023-09-10T10:00:00.000Z', updatedAt: '2023-12-01T10:00:00.000Z' },
  { id: 10, type: 'MEMBERSHIP', amount: 19.99, description: 'Basic membership with standard features', isActive: true, metadata: { planType: 'monthly' }, createdAt: '2023-10-05T10:00:00.000Z', updatedAt: '2023-12-01T10:00:00.000Z' }
];

export const fakePayments = {
  records: [...DUMMY_PAYMENTS],

  initialize() {
    this.records = [...DUMMY_PAYMENTS];
    console.log('Initialized with dummy payments:', this.records.length);
  },

  // Get all payments with optional filtering and search
  async getAll({
    types = [],
    statuses = [],
    search
  }) {
    let payments = [...this.records];

    // Filter payments based on selected types
    if (types.length > 0) {
      payments = payments.filter((payment) =>
        types.includes(payment.type)
      );
    }

    // Filter payments based on selected statuses
    if (statuses.length > 0) {
      payments = payments.filter((payment) =>
        statuses.includes(payment.isActive.toString())
      );
    }

    // Search functionality across multiple fields
    if (search) {
      payments = matchSorter(payments, search, {
        keys: ['type', 'description']
      });
    }

    return payments;
  },

  // Get paginated results with optional filtering and search
  async getPayments({
    page = 1,
    limit = 10,
    types,
    statuses,
    search
  }) {
    await delay(1000);
    
    // Ensure we have payments initialized
    if (this.records.length === 0) {
      this.initialize();
    }
    
    const typesArray = types ? types.split('.') : [];
    const statusesArray = statuses ? statuses.split('.') : [];
    const allPayments = await this.getAll({
      types: typesArray,
      statuses: statusesArray,
      search
    });
    const totalPayments = allPayments.length;

    // Pagination logic
    const offset = (page - 1) * limit;
    const paginatedPayments = allPayments.slice(offset, offset + limit);

    // Mock current time
    const currentTime = new Date().toISOString();

    // Return paginated response
    return {
      success: true,
      time: currentTime,
      message: 'Sample payment data for testing and learning purposes',
      total_payments: totalPayments,
      offset,
      limit,
      payments: paginatedPayments
    };
  },

  // Get a specific payment by its ID
  async getPaymentById(id) {
    await delay(1000); // Simulate a delay

    // Find the payment by its ID
    const payment = this.records.find((payment) => payment.id === id);

    if (!payment) {
      return {
        success: false,
        message: `Payment with ID ${id} not found`
      };
    }

    // Mock current time
    const currentTime = new Date().toISOString();

    return {
      success: true,
      time: currentTime,
      message: `Payment with ID ${id} found`,
      payment
    };
  }
};

// Initialize sample payments
fakePayments.initialize();
