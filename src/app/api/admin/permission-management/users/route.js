import { NextResponse } from 'next/server';

// Mock users data with permissions
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'ADMIN',
    status: 'active',
    avatar: '/avatars/john.jpg',
    lastActive: '2024-01-15T10:30:00.000Z',
    permissions: [
      {
        id: 1,
        name: 'user.create',
        description: 'Create new users',
        source: 'role'
      },
      {
        id: 2,
        name: 'user.read',
        description: 'View user information',
        source: 'role'
      },
      {
        id: 3,
        name: 'user.update',
        description: 'Update user information',
        source: 'role'
      },
      {
        id: 4,
        name: 'user.delete',
        description: 'Delete users',
        source: 'user'
      },
      {
        id: 8,
        name: 'admin.settings',
        description: 'Access admin settings',
        source: 'role'
      }
    ]
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    role: 'MANAGER',
    status: 'active',
    avatar: '/avatars/jane.jpg',
    lastActive: '2024-01-14T16:45:00.000Z',
    permissions: [
      {
        id: 2,
        name: 'user.read',
        description: 'View user information',
        source: 'role'
      },
      {
        id: 3,
        name: 'user.update',
        description: 'Update user information',
        source: 'role'
      },
      {
        id: 5,
        name: 'content.create',
        description: 'Create content',
        source: 'user'
      },
      {
        id: 6,
        name: 'content.read',
        description: 'View content',
        source: 'role'
      }
    ]
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@company.com',
    role: 'EMPLOYEE',
    status: 'active',
    avatar: '/avatars/bob.jpg',
    lastActive: '2024-01-13T09:20:00.000Z',
    permissions: [
      {
        id: 2,
        name: 'user.read',
        description: 'View user information',
        source: 'role'
      },
      {
        id: 6,
        name: 'content.read',
        description: 'View content',
        source: 'role'
      }
    ]
  },
  {
    id: 4,
    name: 'Alice Wilson',
    email: 'alice.wilson@company.com',
    role: 'USER',
    status: 'inactive',
    avatar: '/avatars/alice.jpg',
    lastActive: '2024-01-10T14:15:00.000Z',
    permissions: [
      {
        id: 6,
        name: 'content.read',
        description: 'View content',
        source: 'role'
      }
    ]
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie.brown@company.com',
    role: 'MANAGER',
    status: 'active',
    avatar: '/avatars/charlie.jpg',
    lastActive: '2024-01-15T11:00:00.000Z',
    permissions: [
      {
        id: 2,
        name: 'user.read',
        description: 'View user information',
        source: 'role'
      },
      {
        id: 3,
        name: 'user.update',
        description: 'Update user information',
        source: 'role'
      },
      {
        id: 6,
        name: 'content.read',
        description: 'View content',
        source: 'role'
      },
      {
        id: 7,
        name: 'content.update',
        description: 'Update content',
        source: 'user'
      }
    ]
  },
  {
    id: 6,
    name: 'David Miller',
    email: 'david.miller@company.com',
    role: 'EMPLOYEE',
    status: 'active',
    avatar: '/avatars/david.jpg',
    lastActive: '2024-01-12T08:30:00.000Z',
    permissions: [
      {
        id: 2,
        name: 'user.read',
        description: 'View user information',
        source: 'role'
      }
    ]
  },
  {
    id: 7,
    name: 'Eva Green',
    email: 'eva.green@company.com',
    role: 'USER',
    status: 'active',
    avatar: '/avatars/eva.jpg',
    lastActive: '2024-01-14T12:15:00.000Z',
    permissions: [
      {
        id: 6,
        name: 'content.read',
        description: 'View content',
        source: 'role'
      }
    ]
  },
  {
    id: 8,
    name: 'Frank Davis',
    email: 'frank.davis@company.com',
    role: 'MANAGER',
    status: 'suspended',
    avatar: '/avatars/frank.jpg',
    lastActive: '2024-01-08T16:45:00.000Z',
    permissions: [
      {
        id: 2,
        name: 'user.read',
        description: 'View user information',
        source: 'role'
      },
      {
        id: 3,
        name: 'user.update',
        description: 'Update user information',
        source: 'role'
      }
    ]
  },
  {
    id: 9,
    name: 'Grace Taylor',
    email: 'grace.taylor@company.com',
    role: 'USER',
    status: 'active',
    avatar: '/avatars/grace.jpg',
    lastActive: '2024-01-15T09:20:00.000Z',
    permissions: [
      {
        id: 6,
        name: 'content.read',
        description: 'View content',
        source: 'role'
      }
    ]
  },
  {
    id: 10,
    name: 'Henry Wilson',
    email: 'henry.wilson@company.com',
    role: 'EMPLOYEE',
    status: 'active',
    avatar: '/avatars/henry.jpg',
    lastActive: '2024-01-11T13:30:00.000Z',
    permissions: [
      {
        id: 2,
        name: 'user.read',
        description: 'View user information',
        source: 'role'
      },
      {
        id: 6,
        name: 'content.read',
        description: 'View content',
        source: 'role'
      }
    ]
  },
  {
    id: 11,
    name: 'Ivy Chen',
    email: 'ivy.chen@company.com',
    role: 'ADMIN',
    status: 'active',
    avatar: '/avatars/ivy.jpg',
    lastActive: '2024-01-15T14:00:00.000Z',
    permissions: [
      {
        id: 1,
        name: 'user.create',
        description: 'Create new users',
        source: 'role'
      },
      {
        id: 2,
        name: 'user.read',
        description: 'View user information',
        source: 'role'
      },
      {
        id: 3,
        name: 'user.update',
        description: 'Update user information',
        source: 'role'
      },
      {
        id: 4,
        name: 'user.delete',
        description: 'Delete users',
        source: 'role'
      },
      {
        id: 8,
        name: 'admin.settings',
        description: 'Access admin settings',
        source: 'role'
      }
    ]
  },
  {
    id: 12,
    name: 'Jack Robinson',
    email: 'jack.robinson@company.com',
    role: 'USER',
    status: 'inactive',
    avatar: '/avatars/jack.jpg',
    lastActive: '2024-01-05T10:00:00.000Z',
    permissions: [
      {
        id: 6,
        name: 'content.read',
        description: 'View content',
        source: 'role'
      }
    ]
  },
  {
    id: 13,
    name: 'Kate Anderson',
    email: 'kate.anderson@company.com',
    role: 'MANAGER',
    status: 'active',
    avatar: '/avatars/kate.jpg',
    lastActive: '2024-01-14T15:45:00.000Z',
    permissions: [
      {
        id: 2,
        name: 'user.read',
        description: 'View user information',
        source: 'role'
      },
      {
        id: 3,
        name: 'user.update',
        description: 'Update user information',
        source: 'role'
      },
      {
        id: 5,
        name: 'content.create',
        description: 'Create content',
        source: 'user'
      },
      {
        id: 6,
        name: 'content.read',
        description: 'View content',
        source: 'role'
      },
      {
        id: 7,
        name: 'content.update',
        description: 'Update content',
        source: 'user'
      }
    ]
  },
  {
    id: 14,
    name: 'Leo Martinez',
    email: 'leo.martinez@company.com',
    role: 'EMPLOYEE',
    status: 'active',
    avatar: '/avatars/leo.jpg',
    lastActive: '2024-01-13T11:20:00.000Z',
    permissions: [
      {
        id: 2,
        name: 'user.read',
        description: 'View user information',
        source: 'role'
      },
      {
        id: 6,
        name: 'content.read',
        description: 'View content',
        source: 'role'
      }
    ]
  },
  {
    id: 15,
    name: 'Mia Thompson',
    email: 'mia.thompson@company.com',
    role: 'USER',
    status: 'active',
    avatar: '/avatars/mia.jpg',
    lastActive: '2024-01-15T17:30:00.000Z',
    permissions: [
      {
        id: 6,
        name: 'content.read',
        description: 'View content',
        source: 'role'
      }
    ]
  }
];

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    // Filter users based on search and role
    let filteredUsers = [...mockUsers];

    if (search) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Users with permissions fetched successfully',
      data: {
        users: filteredUsers,
        total: filteredUsers.length,
        filters: { search, role }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      },
      { status: 500 }
    );
  }
}