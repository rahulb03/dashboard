/**
 * Permission Formatting Utility
 * Provides functions to format permissions into human-readable labels and descriptions
 */

/**
 * Get human-readable role label
 */
export const getRoleLabel = (role) => {
  const labels = {
    'ADMIN': 'Administrator',
    'MANAGER': 'Manager',
    'EMPLOYEE': 'Employee',
    'USER': 'Standard User',
    'GUEST': 'Guest'
  };
  return labels[role] || role;
};

/**
 * Get human-readable category label for resources
 * Enhanced with more business-friendly terminology
 */
export const getCategoryLabel = (resource) => {
  const categories = {
    'user': 'Staff & User Management',
    'member': 'Member & Customer Management',
    'loan': 'Loans & Financial Services',
    'payment': 'Payments & Transactions',
    'document': 'Documents & File Management',
    'report': 'Reports & Business Analytics',
    'blog': 'Content & Communications',
    'system': 'System Administration',
    'permission': 'Access Control & Security',
    'dashboard': 'Dashboard & Overview',
    'notification': 'Notifications & Alerts',
    'audit': 'Audit & Compliance',
    'backup': 'Data Backup & Recovery',
    'settings': 'System Configuration',
    'role': 'Role Management',
    'category': 'Organization & Categories',
    'tag': 'Tags & Classification',
    'comment': 'Comments & Feedback',
    'support': 'Customer Support',
    'security': 'Security & Protection'
  };
  return categories[resource] || resource.charAt(0).toUpperCase() + resource.slice(1) + ' Management';
};

/**
 * Get icon for resource category
 * Enhanced with more comprehensive icon set
 */
export const getCategoryIcon = (resource) => {
  const icons = {
    'user': '👤',
    'member': '👥',
    'loan': '💰',
    'payment': '💳',
    'document': '📄',
    'report': '📊',
    'blog': '📝',
    'system': '⚙️',
    'permission': '🔑',
    'dashboard': '📋',
    'notification': '🔔',
    'audit': '🔍',
    'backup': '💾',
    'settings': '⚙️',
    'role': '🎭',
    'category': '📂',
    'tag': '🏷️',
    'comment': '💬',
    'feedback': '📝',
    'support': '🎧',
    'security': '🛡️',
    'admin': '👑',
    'finance': '💰',
    'analytics': '📈',
    'content': '📰',
    'communication': '📞'
  };
  return icons[resource] || '📁';
};

/**
 * Get human-readable permission label from resource and action
 * Enhanced for non-technical users with more descriptive language
 */
export const getPermissionLabel = (resource, action) => {
  // If already formatted (contains space), return as is
  if (resource && resource.includes(' ')) {
    return resource;
  }

  // Enhanced action labels with more user-friendly language
  const actionLabels = {
    'create': 'Create New',
    'read': 'View & Read',
    'update': 'Edit & Update',
    'delete': 'Delete & Remove',
    'approve': 'Approve & Accept',
    'reject': 'Reject & Decline',
    'export': 'Export & Download',
    'import': 'Import & Upload',
    'manage': 'Full Management Access',
    'view': 'View Only',
    'edit': 'Edit & Modify',
    'add': 'Add New',
    'remove': 'Remove & Delete',
    'execute': 'Run & Execute',
    'download': 'Download Files',
    'upload': 'Upload Files',
    'grant': 'Grant Access',
    'revoke': 'Remove Access',
    'assign': 'Assign & Distribute',
    'publish': 'Publish & Make Live',
    'archive': 'Archive & Store',
    'restore': 'Restore & Recover'
  };
  
  // Enhanced resource labels with more descriptive names
  const resourceLabels = {
    'user': 'User Accounts',
    'member': 'Member Profiles',
    'loan': 'Loan Applications',
    'payment': 'Payment Records',
    'document': 'Documents & Files',
    'report': 'Reports & Analytics',
    'blog': 'Blog Articles',
    'system': 'System Settings',
    'permission': 'Access Permissions',
    'dashboard': 'Dashboard Data',
    'notification': 'Notifications & Alerts',
    'audit': 'Audit Logs',
    'backup': 'System Backups',
    'settings': 'Configuration Settings',
    'role': 'User Roles',
    'category': 'Categories & Groups',
    'tag': 'Tags & Labels',
    'comment': 'Comments & Reviews',
    'feedback': 'User Feedback',
    'support': 'Support Tickets'
  };

  const actionLabel = actionLabels[action] || action.charAt(0).toUpperCase() + action.slice(1);
  const resourceLabel = resourceLabels[resource] || resource.charAt(0).toUpperCase() + resource.slice(1);
  
  return `${actionLabel} ${resourceLabel}`;
};

/**
 * Get permission description based on resource and action
 * Enhanced with more detailed, business-friendly descriptions
 */
export const getPermissionDescription = (resource, action, existingDescription) => {
  // If existing description is provided and meaningful, use it
  if (existingDescription && existingDescription !== '' && !existingDescription.includes(':')) {
    return existingDescription;
  }

  const descriptions = {
    // User permissions - Enhanced descriptions
    'user:create': 'Allow creation of new user accounts, setting up profiles, and assigning initial access levels',
    'user:read': 'View user profiles, contact information, roles, and account status (cannot modify)',
    'user:update': 'Edit user details, update profiles, change roles, and modify account settings',
    'user:delete': 'Permanently remove user accounts and all associated data from the system',
    'user:manage': 'Complete control over all user operations including creation, editing, and deletion',
    
    // Member permissions - Enhanced descriptions
    'member:create': 'Register new members, set up membership profiles, and assign membership levels',
    'member:read': 'Access member information, view membership status, and browse member directories',
    'member:update': 'Modify member details, update membership information, and change membership levels',
    'member:delete': 'Remove member records and terminate memberships permanently',
    'member:approve': 'Review and approve new membership applications and membership changes',
    'member:reject': 'Decline membership applications with appropriate reasoning',
    
    // Loan permissions - Enhanced descriptions
    'loan:create': 'Initiate new loan applications, enter loan details, and start the approval process',
    'loan:read': 'View loan applications, check status, review terms, and access loan history',
    'loan:update': 'Modify loan details, adjust terms, update status, and edit loan information',
    'loan:delete': 'Remove loan records and cancel loan applications (use with caution)',
    'loan:approve': 'Approve loan applications, set final terms, and authorize loan disbursement',
    'loan:reject': 'Decline loan applications with documented reasons for rejection',
    'loan:manage': 'Full authority over all loan operations and decision-making processes',
    
    // Payment permissions - Enhanced descriptions
    'payment:create': 'Process new payments, record transactions, and handle payment entries',
    'payment:read': 'View payment history, transaction details, and payment status information',
    'payment:update': 'Edit payment records, correct transaction details, and update payment status',
    'payment:delete': 'Remove payment records (restricted action - requires strong justification)',
    'payment:refund': 'Process refunds, reverse transactions, and handle payment returns',
    'payment:approve': 'Authorize payment transactions and approve financial transfers',
    
    // Document permissions - Enhanced descriptions
    'document:create': 'Upload new documents, create file records, and organize document storage',
    'document:read': 'Access documents, view file contents, and download files for viewing',
    'document:update': 'Edit document details, modify file information, and update document metadata',
    'document:delete': 'Remove documents from the system permanently (cannot be undone)',
    'document:download': 'Download documents to local device for offline access',
    'document:upload': 'Add new files and documents to the system storage',
    
    // Report permissions - Enhanced descriptions
    'report:read': 'View generated reports, access analytics dashboards, and browse report archives',
    'report:create': 'Generate new reports, customize report parameters, and create analysis documents',
    'report:export': 'Export reports to various formats (PDF, Excel, CSV) for external use',
    'report:manage': 'Full control over reporting system including creation, modification, and deletion',
    
    // System permissions - Enhanced descriptions
    'system:read': 'View system configuration, check settings, and monitor system status (read-only)',
    'system:update': 'Modify system settings, update configurations, and change system parameters',
    'system:manage': 'Complete control over system administration and critical system functions',
    
    // Permission management - Enhanced descriptions
    'permission:read': 'View what permissions users have and review access control settings',
    'permission:grant': 'Give new permissions to users and expand their access capabilities',
    'permission:revoke': 'Remove permissions from users and restrict their access to certain features',
    'permission:manage': 'Full authority over access control, user permissions, and security settings',
    
    // Additional common permissions
    'dashboard:read': 'Access main dashboard and view summary information and key metrics',
    'notification:read': 'View system notifications, alerts, and important announcements',
    'notification:create': 'Send notifications to users and create system-wide announcements',
    'audit:read': 'Access audit logs, view system activity, and review security events',
    'backup:create': 'Initiate system backups and create data recovery points',
    'backup:restore': 'Restore system data from backups (high-risk operation)',
    'blog:create': 'Write and publish new blog posts and content articles',
    'blog:update': 'Edit existing blog content and modify published articles',
    'blog:delete': 'Remove blog posts and content from public view',
    'comment:approve': 'Review and approve user comments before they appear publicly',
    'comment:delete': 'Remove inappropriate or unwanted comments from the system'
  };
  
  const key = `${resource}:${action}`;
  return descriptions[key] || `Provides ${action} access to ${resource} with appropriate business controls and oversight`;
};

/**
 * Check if a permission is considered basic/safe
 */
export const isBasicPermission = (action) => {
  return ['read', 'view', 'list'].includes(action?.toLowerCase());
};

/**
 * Check if a permission is considered dangerous/sensitive
 */
export const isDangerousPermission = (action) => {
  return ['delete', 'manage', 'approve', 'reject', 'remove'].includes(action?.toLowerCase());
};

/**
 * Format permission from backend format (resource:action) to human-readable
 */
export const formatPermissionFromBackend = (permission) => {
  if (!permission) return '';
  
  // If it's already formatted (has spaces), return as is
  if (permission.includes(' ') && !permission.includes(':')) {
    return permission;
  }
  
  // Handle resource:action format
  if (permission.includes(':')) {
    const [resource, action] = permission.split(':');
    return getPermissionLabel(resource, action);
  }
  
  return permission;
};

/**
 * Get badge color based on permission type
 */
export const getPermissionBadgeColor = (action) => {
  if (isBasicPermission(action)) {
    return 'bg-green-100 text-green-800';
  }
  if (isDangerousPermission(action)) {
    return 'bg-red-100 text-red-800';
  }
  return 'bg-blue-100 text-blue-800';
};

/**
 * Get status badge color
 */
export const getStatusBadgeColor = (status) => {
  const colors = {
    'active': 'bg-green-100 text-green-800',
    'expired': 'bg-gray-100 text-gray-800',
    'revoked': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800'
  };
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Format date for display
 */
export const formatDate = (date) => {
  if (!date) return 'Never';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Check if permission is expired
 */
export const isPermissionExpired = (expiresAt) => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};