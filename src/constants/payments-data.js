// Sample payment data - for development/testing
export const PAYMENTS_DATA = [
  {
    id: 1,
    userId: 101,
    user: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      mobile: '+1234567890',
      avatar: null
    },
    amount: 999.99,
    type: 'LOAN_FEE',
    status: 'SUCCESS',
    cashfreeOrderId: 'CF_ORDER_001',
    createdAt: '2023-12-01T10:00:00.000Z',
    paidAt: '2023-12-01T10:05:00.000Z',
    refundedAt: null,
    refunded: false
  },
  {
    id: 2,
    userId: 102,
    user: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      mobile: '+1234567891',
      avatar: null
    },
    amount: 29.99,
    type: 'MEMBERSHIP',
    status: 'FAILED',
    cashfreeOrderId: 'CF_ORDER_002',
    createdAt: '2023-12-01T11:00:00.000Z',
    paidAt: null,
    refundedAt: null,
    refunded: false
  },
  {
    id: 3,
    userId: 103,
    user: {
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      mobile: '+1234567892',
      avatar: null
    },
    amount: 15.00,
    type: 'DOCUMENT_FEE',
    status: 'PENDING',
    cashfreeOrderId: 'CF_ORDER_003',
    createdAt: '2023-12-01T12:00:00.000Z',
    paidAt: null,
    refundedAt: null,
    refunded: false
  },
  {
    id: 4,
    userId: 104,
    user: {
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      mobile: '+1234567893',
      avatar: null
    },
    amount: 299.99,
    type: 'MEMBERSHIP',
    status: 'SUCCESS',
    cashfreeOrderId: 'CF_ORDER_004',
    createdAt: '2023-12-01T13:00:00.000Z',
    paidAt: '2023-12-01T13:02:00.000Z',
    refundedAt: '2023-12-01T14:00:00.000Z',
    refunded: true
  },
  {
    id: 5,
    userId: 105,
    user: {
      name: 'David Brown',
      email: 'david.brown@example.com',
      mobile: '+1234567894',
      avatar: null
    },
    amount: 25.00,
    type: 'LOAN_FEE',
    status: 'CREATED',
    cashfreeOrderId: 'CF_ORDER_005',
    createdAt: '2023-12-01T14:00:00.000Z',
    paidAt: null,
    refundedAt: null,
    refunded: false
  }
];

// Helper function to get payment by ID
export const getPaymentById = (id) => {
  return PAYMENTS_DATA.find(payment => payment.id === parseInt(id));
};

// Helper function to filter payments by status
export const getPaymentsByStatus = (status) => {
  if (!status) return PAYMENTS_DATA;
  return PAYMENTS_DATA.filter(payment => payment.status === status);
};

// Helper function to filter payments by type
export const getPaymentsByType = (type) => {
  if (!type) return PAYMENTS_DATA;
  return PAYMENTS_DATA.filter(payment => payment.type === type);
};

// Get all unique payment types
export const getPaymentTypes = () => {
  return [...new Set(PAYMENTS_DATA.map(payment => payment.type))];
};

// Get all unique payment statuses
export const getPaymentStatuses = () => {
  return [...new Set(PAYMENTS_DATA.map(payment => payment.status))];
};