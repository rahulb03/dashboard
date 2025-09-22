export const API_BASE_URL = "http://localhost:3000/api/admin/";
export const IMAGE_URL = "https://localhost:3000/uploads/";

export const SERVER_URL = process.env.NEXT_PUBLIC_API_URL;

export const WEBSITE_NAME = "Highfly Global Gateways";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "auth/signin",
    SIGN_UP: "auth/signup",
    PROFILE: "auth/profile",
    LOGOUT: "auth/signout",
    UPDATE: "auth/profile",
    CHANGE_PASSWORD: "auth/changepassword",
  },


LOAN_APPLICATION : {
    LIST: "loans",
    CREATE: "loans",
    GET_ONE: (id) => `loans/${id}`,
    UPDATE: (id) => `loans/${id}`,
    DELETE: (id) => `loans/${id}`,
    DOWNLOAD_DOCUMENT: (loanId, documentId) => `loans/${loanId}/documents/${documentId}/download`,
    UPDATE_STATUS: (id) => `loans/${id}/status`,
    UPDATE_PAYMENT_STATUS: (id) => `loans/${id}/payment-status`,
    
  },

  
  DOCUMENT : {
    DOWNLOAD_DOCUMENT : (loanId) => `documents/application/${loanId}`
  },

  SALARY  : {

    LIST: "salary",
    CREATE: "salary",
    GET_ONE: (id) => `salary/${id}`,
    UPDATE: (id) => `salary/${id}`,
    DELETE: (id) => `salary/${id}`,

  } ,


  BLOG : {
    LIST: "blogs",
    CREATE: "blogs",
    GET_ONE: (id) => `blogs/${id}`,
    UPDATE: (id) => `blogs/${id}`,
    DELETE: (id) => `blogs/${id}`,
  } ,

  FAQ : {
    LIST: "faq",
    CREATE: "faq",
    GET_ONE: (id) => `faq/${id}`,
    UPDATE: (id) => `faq/${id}`,
    DELETE: (id) => `faq/${id}`,
  } ,

  MEMBER : {
    LIST: "members",
    CREATE: "members",
    GET_ONE: (id) => `members/${id}`,
    UPDATE: (id) => `members/${id}`,
    DELETE: (id) => `members/${id}`,
    ASSIGN_ROLE: "members/assign-role",
    GET_BY_ROLE: (role) => `members/role/${role}`,
  },

  PERMISSIONS: {
    USERS_WITH_PERMISSIONS: "permission-management/users",
    AVAILABLE_PERMISSIONS: "permission-management/permissions",
    GRANT: "permission-management/grant",
    REVOKE: "permission-management/revoke",
    HISTORY: (userId) => `permission-management/history/${userId}`,
  },

};
