
//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  // {
  //   title: 'Product',
  //   url: '/dashboard/product',
  //   icon: 'product',
  //   shortcut: ['p', 'p'],
  //   isActive: false,
  //   items: [] // No child items
  // },
  

   {
    title: 'Loan Management',
    url: '/dashboard/loans',
    icon: 'loan',
    shortcut: ['l', 'm'],
    isActive: false,
    items: [
      {
        title: 'Applications',
        url: '/dashboard/loans/applications',
        shortcut: ['l', 'a']
      },
      {
        title: 'Documents',
        url: '/dashboard/loans/documents',
        shortcut: ['l', 'd']
      },
      {
        title: 'Payments',
        url: '/dashboard/loans/payments',
        shortcut: ['l', 'p']
      }
    ]
  }, 

   {
    title: 'Memberships',
    url: '/dashboard/memberships',
    icon: 'membership',
    shortcut: ['m', 's'],
    isActive: false,
    items: [] // No child items - direct link to memberships
  },

  {
    title: 'Payments',
    url: '/dashboard/payments',
    icon: 'payment',
    shortcut: ['p', 'm'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Payments configurations',
    url: '/dashboard/payment-configurations',
    icon: 'payment',
    shortcut: ['p', 'm'],
    isActive: false,
    items: [] // No child items
  },
  // {
  //   title: 'Kanban',
  //   url: '/dashboard/kanban',
  //   icon: 'kanban',
  //   shortcut: ['k', 'k'],
  //   isActive: false,
  //   items: [] // No child items
  // },
  {
    title: 'Permissions',
    url: '/dashboard/permissions',
    icon: 'shield',
    shortcut: ['r', 'r'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Members',
    url: '/dashboard/members',
    icon: 'users',
    shortcut: ['m', 'e'],
    isActive: false,
    items: [] // No child items - direct link to members
  },
 
  {
    title: 'Salary Configurations',
    url: '/dashboard/salary',
    icon: 'salary',
    shortcut: ['s', 'c'],
    isActive: false,
    items: [] // No child items
  },
 
  {
    title: 'Tracking Analytics',
    url: '/dashboard/tracking',
    icon: 'analytics',
    shortcut: ['t', 'a'],
    isActive: false,
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/tracking/dashboard',
        shortcut: ['t', 'd']
      },
      {
        title: 'Sessions',
        url: '/dashboard/tracking/sessions',
        shortcut: ['t', 's']
      },
      {
        title: 'Analytics',
        url: '/dashboard/tracking/analytics',
        shortcut: ['t', 'r']
      },
      {
        title: 'Health',
        url: '/dashboard/tracking/health',
        shortcut: ['t', 'h']
      }
    ]
  } ,

    {
    title: 'Account',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'billing',
    isActive: true,

    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
     
    ]
  },
];



export const recentSalesData = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
