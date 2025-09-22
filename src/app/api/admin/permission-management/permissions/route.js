import { NextResponse } from 'next/server';

// Mock permissions data organized by category
const mockPermissions = {
  categories: [
    {
      id: 1,
      name: 'User Management',
      description: 'Permissions related to user operations',
      permissions: [
        {
          id: 1,
          name: 'user.create',
          description: 'Create new users',
          category: 'User Management',
          isSystemCritical: true
        },
        {
          id: 2,
          name: 'user.read',
          description: 'View user information',
          category: 'User Management',
          isSystemCritical: false
        },
        {
          id: 3,
          name: 'user.update',
          description: 'Update user information',
          category: 'User Management',
          isSystemCritical: false
        },
        {
          id: 4,
          name: 'user.delete',
          description: 'Delete users',
          category: 'User Management',
          isSystemCritical: true
        }
      ]
    },
    {
      id: 2,
      name: 'Content Management',
      description: 'Permissions related to content operations',
      permissions: [
        {
          id: 5,
          name: 'content.create',
          description: 'Create content',
          category: 'Content Management',
          isSystemCritical: false
        },
        {
          id: 6,
          name: 'content.read',
          description: 'View content',
          category: 'Content Management',
          isSystemCritical: false
        },
        {
          id: 7,
          name: 'content.update',
          description: 'Update content',
          category: 'Content Management',
          isSystemCritical: false
        },
        {
          id: 8,
          name: 'content.delete',
          description: 'Delete content',
          category: 'Content Management',
          isSystemCritical: false
        }
      ]
    },
    {
      id: 3,
      name: 'Administration',
      description: 'Administrative permissions',
      permissions: [
        {
          id: 9,
          name: 'admin.settings',
          description: 'Access admin settings',
          category: 'Administration',
          isSystemCritical: true
        },
        {
          id: 10,
          name: 'admin.reports',
          description: 'Access admin reports',
          category: 'Administration',
          isSystemCritical: false
        },
        {
          id: 11,
          name: 'admin.audit',
          description: 'Access audit logs',
          category: 'Administration',
          isSystemCritical: true
        }
      ]
    },
    {
      id: 4,
      name: 'Financial',
      description: 'Financial and payment related permissions',
      permissions: [
        {
          id: 12,
          name: 'finance.read',
          description: 'View financial data',
          category: 'Financial',
          isSystemCritical: false
        },
        {
          id: 13,
          name: 'finance.update',
          description: 'Update financial data',
          category: 'Financial',
          isSystemCritical: true
        },
        {
          id: 14,
          name: 'finance.reports',
          description: 'Generate financial reports',
          category: 'Financial',
          isSystemCritical: false
        }
      ]
    }
  ],
  totalPermissions: 14,
  lastUpdated: '2024-01-15T10:00:00.000Z'
};

export async function GET(request) {
  try {
    // Get query parameters (if any filters are needed in future)
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';

    let filteredData = { ...mockPermissions };

    // Filter by category if provided
    if (category) {
      filteredData.categories = filteredData.categories.filter(cat => 
        cat.name.toLowerCase().includes(category.toLowerCase())
      );
      
      // Recalculate total permissions
      filteredData.totalPermissions = filteredData.categories.reduce(
        (total, cat) => total + cat.permissions.length, 
        0
      );
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      message: 'Available permissions fetched successfully',
      data: filteredData
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch permissions',
        error: error.message
      },
      { status: 500 }
    );
  }
}