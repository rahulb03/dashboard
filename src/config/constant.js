export const API_BASE_URL = 'http://localhost:3000/api/admin/';
export const IMAGE_URL = 'http://localhost:3000/';


export const WEBSITE_NAME = 'One Gred Dashboard';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: 'auth/signin',
    SIGN_UP: 'auth/signup',
    PROFILE: 'auth/profile',
    LOGOUT: 'auth/signout',
    UPDATE: 'auth/profile',
    CHANGE_PASSWORD: 'auth/changepassword' ,
    PHOTO : 'auth/profile/photo'
    
  },

  LOAN_APPLICATION: {
    LIST: 'loans',
    GET_ONE: (id) => `loans/${id}`,
    UPDATE: (id) => `loans/${id}`,
    DELETE: (id) => `loans/${id}`,
    VIEW_DOCUMENT: (loanId, documentId) =>
      `loans/${loanId}/documents/${documentId}/view`,
    DOWNLOAD_DOCUMENT: (loanId, documentId) =>
      `loans/${loanId}/documents/${documentId}/download`,
    UPDATE_STATUS: (id) => `loans/${id}/status`,
    UPDATE_PAYMENT_STATUS: (id) => `loans/${id}/payment-status`,
    CREATE: 'loans',

    
    
    CREATE_WITH_DOCUMENTS: () => `loans/with-documents`,
    UPDATE_WITH_DOCUMENTS: (id) => `loans/${id}/with-documents`
  },

  DOCUMENT: {
    DOWNLOAD_DOCUMENT: (loanId) => `documents/application/${loanId}`
  },

  BLOG: {
    LIST: 'blogs',
    CREATE: 'blogs',
    GET_ONE: (id) => `blogs/${id}`,
    UPDATE: (id) => `blogs/${id}`,
    DELETE: (id) => `blogs/${id}`
  },

  FAQ: {
    LIST: 'faq',
    CREATE: 'faq',
    GET_ONE: (id) => `faq/${id}`,
    UPDATE: (id) => `faq/${id}`,
    DELETE: (id) => `faq/${id}`
  },

  MEMBER: {
    LIST: 'members',
    CREATE: 'members',
    GET_ONE: (id) => `members/${id}`,
    UPDATE: (id) => `members/${id}`,
    DELETE: (id) => `members/${id}`,
    ASSIGN_ROLE: 'members/assign-role',
    GET_BY_ROLE: (role) => `members/role/${role}`
  },

  PERMISSIONS: {
    USERS_WITH_PERMISSIONS: 'permission-management/users',
    AVAILABLE_PERMISSIONS: 'permission-management/permissions',
    GRANT: 'permission-management/grant',
    REVOKE: 'permission-management/revoke',
    HISTORY: (userId) => `permission-management/history/${userId}`
  },

  // Payment Configuration Management
  PAYMENT_CONFIG: {
    CREATE: 'payments-config',
    LIST: 'payments-config',
    GET_ONE: (id) => `payments-config/${id}`,
    UPDATE: (id) => `payments-config/${id}`,
    DELETE: (id) => `payments-config/${id}`,
    TOGGLE: (id) => `payments-config/${id}/toggle`,
    ACTIVE: 'payments-config/active'
  },

  // Payment Transaction Management
  PAYMENTS: {
    LIST: 'payments',
    CREATE: 'payments',
    GET_ONE: (id) => `payments/${id}`,
    UPDATE: (id) => `payments/${id}`,
    DELETE: (id) => `payments/${id}`,
    UPDATE_STATUS: (id) => `payments/${id}/status`,
    GET_BY_USER: (userId) => `payments/user/${userId}`,
    GET_BY_APPLICATION: (applicationId) => `payments/application/${applicationId}`,
    SEARCH: 'payments/search'
  },

  SALARY: {
    LIST: 'salary',
    CREATE: 'salary',
    GET_ONE: (id) => `salary/${id}`,
    UPDATE: (id) => `salary/${id}`,
    DELETE: (id) => `salary/${id}`
  },

  // Tracking Analytics Management (Legacy)
  TRACKING: {
    DASHBOARD: 'tracking/dashboard',
    SESSIONS: 'tracking/sessions',
    SESSION_DETAILS: (sessionId) => `tracking/session/${sessionId}`,
    FUNNEL_OPTIMIZED: 'tracking/funnel-optimized',
    TRENDS: 'tracking/trends',
    STATS_SUMMARY: 'tracking/stats-summary',
    HEALTH: 'tracking/health',
    CALCULATE_STATS: 'tracking/calculate-stats'
  },

  MEMBERSHIP : {
    LIST: 'memberships',
    CREATE: 'memberships',
    GET_ONE: (id) => `memberships/${id}`,
    UPDATE: (id) => `memberships/${id}`,
    DELETE: (id) => `memberships/${id}`,
    GET_USER_MEMBERSHIP: 'memberships/my-membership',
    BULK_UPDATE: 'memberships/bulk-update',
    EXTEND: 'memberships/extend',
    STATS: 'memberships/stats',
    UPDATE_EXPIRED: 'memberships/update-expired'
  },

  // Payment Management
  PAYMENTS: {
    LIST: 'payments',
    GET_ONE: (id) => `payments/${id}`,
    DELETE: (id) => `payments/${id}`,
    REFUND: (id) => `payments/${id}/refund`,
    USER_HISTORY: 'payments/user/history'
  }

};
