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

// Mock Tracking/Funnel Analytics Data
const DUMMY_FUNNEL_STEPS = [
  { stepName: 'welcome', stepIndex: 0, totalEntries: 1500, totalCompletions: 1350, conversionRate: 90.0, errorRate: 2.5 },
  { stepName: 'phone', stepIndex: 1, totalEntries: 1350, totalCompletions: 1200, conversionRate: 88.9, errorRate: 3.2 },
  { stepName: 'otp', stepIndex: 2, totalEntries: 1200, totalCompletions: 1050, conversionRate: 87.5, errorRate: 5.1 },
  { stepName: 'application', stepIndex: 3, totalEntries: 1050, totalCompletions: 900, conversionRate: 85.7, errorRate: 4.8 },
  { stepName: 'cibil', stepIndex: 4, totalEntries: 900, totalCompletions: 720, conversionRate: 80.0, errorRate: 7.2 },
  { stepName: 'payment', stepIndex: 5, totalEntries: 720, totalCompletions: 650, conversionRate: 90.3, errorRate: 2.1 },
  { stepName: 'cibil-otp', stepIndex: 6, totalEntries: 650, totalCompletions: 580, conversionRate: 89.2, errorRate: 3.4 },
  { stepName: 'loan-amount', stepIndex: 7, totalEntries: 580, totalCompletions: 520, conversionRate: 89.7, errorRate: 2.8 },
  { stepName: 'apply-for-loan', stepIndex: 8, totalEntries: 520, totalCompletions: 480, conversionRate: 92.3, errorRate: 1.5 },
  { stepName: 'loan-application-success', stepIndex: 9, totalEntries: 480, totalCompletions: 460, conversionRate: 95.8, errorRate: 0.8 },
  { stepName: 'document-payment', stepIndex: 10, totalEntries: 460, totalCompletions: 420, conversionRate: 91.3, errorRate: 2.2 },
  { stepName: 'payment-successfully', stepIndex: 11, totalEntries: 420, totalCompletions: 400, conversionRate: 95.2, errorRate: 1.1 },
  { stepName: 'upload-documents', stepIndex: 12, totalEntries: 400, totalCompletions: 350, conversionRate: 87.5, errorRate: 4.5 },
  { stepName: 'document-upload-success', stepIndex: 13, totalEntries: 350, totalCompletions: 320, conversionRate: 91.4, errorRate: 2.8 },
  { stepName: 'loan-approved', stepIndex: 14, totalEntries: 320, totalCompletions: 280, conversionRate: 87.5, errorRate: 1.2 },
  { stepName: 'signup', stepIndex: 15, totalEntries: 280, totalCompletions: 250, conversionRate: 89.3, errorRate: 3.1 },
  { stepName: 'cibil-skip', stepIndex: 16, totalEntries: 150, totalCompletions: 130, conversionRate: 86.7, errorRate: 4.2 }
];

const DUMMY_TREND_DATA = {
  welcome: [
    { date: '2024-01-20', totalEntries: 200, conversionRate: 89.5, errorRate: 2.8 },
    { date: '2024-01-21', totalEntries: 180, conversionRate: 91.2, errorRate: 2.1 },
    { date: '2024-01-22', totalEntries: 220, conversionRate: 88.8, errorRate: 3.2 },
    { date: '2024-01-23', totalEntries: 190, conversionRate: 92.1, errorRate: 1.9 },
    { date: '2024-01-24', totalEntries: 210, conversionRate: 89.7, errorRate: 2.5 },
    { date: '2024-01-25', totalEntries: 250, conversionRate: 90.8, errorRate: 2.3 },
    { date: '2024-01-26', totalEntries: 260, conversionRate: 88.9, errorRate: 2.7 }
  ],
  phone: [
    { date: '2024-01-20', totalEntries: 179, conversionRate: 87.7, errorRate: 3.5 },
    { date: '2024-01-21', totalEntries: 164, conversionRate: 89.0, errorRate: 3.1 },
    { date: '2024-01-22', totalEntries: 195, conversionRate: 86.2, errorRate: 4.2 },
    { date: '2024-01-23', totalEntries: 175, conversionRate: 90.3, errorRate: 2.8 },
    { date: '2024-01-24', totalEntries: 188, conversionRate: 88.1, errorRate: 3.4 },
    { date: '2024-01-25', totalEntries: 227, conversionRate: 89.4, errorRate: 3.0 },
    { date: '2024-01-26', totalEntries: 231, conversionRate: 87.9, errorRate: 3.6 }
  ],
  otp: [
    { date: '2024-01-20', totalEntries: 157, conversionRate: 85.4, errorRate: 5.8 },
    { date: '2024-01-21', totalEntries: 146, conversionRate: 88.1, errorRate: 4.9 },
    { date: '2024-01-22', totalEntries: 168, conversionRate: 84.5, errorRate: 6.2 },
    { date: '2024-01-23', totalEntries: 158, conversionRate: 89.2, errorRate: 4.1 },
    { date: '2024-01-24', totalEntries: 166, conversionRate: 86.7, errorRate: 5.3 },
    { date: '2024-01-25', totalEntries: 203, conversionRate: 87.8, errorRate: 4.8 },
    { date: '2024-01-26', totalEntries: 203, conversionRate: 85.7, errorRate: 5.5 }
  ],
  application: [
    { date: '2024-01-20', totalEntries: 134, conversionRate: 83.6, errorRate: 5.2 },
    { date: '2024-01-21', totalEntries: 129, conversionRate: 86.0, errorRate: 4.7 },
    { date: '2024-01-22', totalEntries: 142, conversionRate: 82.4, errorRate: 5.8 },
    { date: '2024-01-23', totalEntries: 141, conversionRate: 87.2, errorRate: 4.3 },
    { date: '2024-01-24', totalEntries: 144, conversionRate: 84.7, errorRate: 5.1 },
    { date: '2024-01-25', totalEntries: 178, conversionRate: 85.9, errorRate: 4.9 },
    { date: '2024-01-26', totalEntries: 174, conversionRate: 83.9, errorRate: 5.4 }
  ],
  cibil: [
    { date: '2024-01-20', totalEntries: 112, conversionRate: 78.6, errorRate: 7.8 },
    { date: '2024-01-21', totalEntries: 111, conversionRate: 81.1, errorRate: 6.9 },
    { date: '2024-01-22', totalEntries: 117, conversionRate: 77.8, errorRate: 8.2 },
    { date: '2024-01-23', totalEntries: 123, conversionRate: 82.1, errorRate: 6.5 },
    { date: '2024-01-24', totalEntries: 122, conversionRate: 79.5, errorRate: 7.4 },
    { date: '2024-01-25', totalEntries: 153, conversionRate: 80.7, errorRate: 7.1 },
    { date: '2024-01-26', totalEntries: 146, conversionRate: 78.8, errorRate: 7.9 }
  ],
  payment: [
    { date: '2024-01-20', totalEntries: 88, conversionRate: 89.8, errorRate: 2.3 },
    { date: '2024-01-21', totalEntries: 90, conversionRate: 91.1, errorRate: 1.9 },
    { date: '2024-01-22', totalEntries: 91, conversionRate: 88.9, errorRate: 2.7 },
    { date: '2024-01-23', totalEntries: 101, conversionRate: 91.1, errorRate: 1.8 },
    { date: '2024-01-24', totalEntries: 97, conversionRate: 90.7, errorRate: 2.1 },
    { date: '2024-01-25', totalEntries: 123, conversionRate: 89.4, errorRate: 2.4 },
    { date: '2024-01-26', totalEntries: 115, conversionRate: 90.4, errorRate: 2.2 }
  ]
};

export const fakeTrackingData = {
  funnelSteps: [...DUMMY_FUNNEL_STEPS],
  trendData: { ...DUMMY_TREND_DATA },

  initialize() {
    this.funnelSteps = [...DUMMY_FUNNEL_STEPS];
    this.trendData = { ...DUMMY_TREND_DATA };
    console.log('Initialized with dummy tracking data:', this.funnelSteps.length, 'funnel steps');
  },

  // Get enhanced funnel analytics
  async getEnhancedFunnel({ dateRange = '7d' } = {}) {
    await delay(800);
    
    const totalUsers = this.funnelSteps[0]?.totalEntries || 1500;
    const completedUsers = this.funnelSteps[this.funnelSteps.length - 3]?.totalCompletions || 250; // Use signup step
    const overallConversion = totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0;
    
    return {
      success: true,
      data: {
        funnel: this.funnelSteps.map(step => ({
          ...step,
          totalReached: step.totalEntries,
          totalCompleted: step.totalCompletions,
          dropOffCount: step.totalEntries - step.totalCompletions,
          dropOffRate: 100 - step.conversionRate
        })),
        totalUsers,
        completedUsers,
        overallConversion: parseFloat(overallConversion.toFixed(2)),
        dateRange,
        meta: {
          generatedAt: new Date().toISOString(),
          stepCount: this.funnelSteps.length
        }
      }
    };
  },

  // Get trend analysis
  async getTrendAnalysis({ period = 'daily', periods = 7 } = {}) {
    await delay(600);
    
    return {
      success: true,
      data: {
        trends: this.trendData,
        period,
        periods,
        summary: {
          totalSteps: Object.keys(this.trendData).length,
          dateRange: {
            start: '2024-01-20',
            end: '2024-01-26'
          },
          avgConversion: 87.2,
          avgErrorRate: 3.8
        },
        meta: {
          generatedAt: new Date().toISOString(),
          dataPoints: periods * Object.keys(this.trendData).length
        }
      }
    };
  }
};

// Initialize tracking data
fakeTrackingData.initialize();
