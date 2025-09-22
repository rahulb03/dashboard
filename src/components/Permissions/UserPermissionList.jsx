import React, { memo, useMemo } from 'react';
import { User, Mail, Shield, Clock, MoreVertical, Plus, Minus, History } from 'lucide-react';

const UserPermissionList = memo(({ users, loading, onGrantPermission, onRevokePermission, onViewHistory }) => {
  // Memoize expensive calculations
  const getRoleBadgeClass = useMemo(() => {
    const classes = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800', 
      user: 'bg-green-100 text-green-800',
      guest: 'bg-gray-100 text-gray-800'
    };
    return (role) => classes[role] || 'bg-gray-100 text-gray-800';
  }, []);

  const formatDate = useMemo(() => {
    return (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    };
  }, []);

  // Memoize processed users data to avoid recalculations
  const processedUsers = useMemo(() => {
    // Enhanced safety checks
    if (!users || !Array.isArray(users)) {
      console.warn('UserPermissionList: users is not an array:', users);
      return [];
    }
    
    return users.map(user => ({
      ...user,
      displayName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
      roleBadgeClass: getRoleBadgeClass(user.role),
      formattedDate: formatDate(user.updatedAt),
      hasPermissions: user.permissions && user.permissions.length > 0
    }));
  }, [users, getRoleBadgeClass, formatDate]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No users found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Modified
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {processedUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.displayName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.roleBadgeClass}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.hasPermissions ? (
                      <>
                        {user.permissions.slice(0, 3).map((permission, index) => (
                          <span
                            key={permission.id || index}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded"
                            title={permission.description || ''}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {permission.name || `${permission.resource}:${permission.action}`}
                          </span>
                        ))}
                        {user.permissions.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                            +{user.permissions.length - 3} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">No special permissions</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {user.formattedDate}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="relative inline-block text-left">
                    <div className="dropdown">
                      <button className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dropdown-toggle">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      <div className="dropdown-menu hidden absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <button
                            onClick={() => onGrantPermission(user)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Grant Permission</span>
                          </button>
                          <button
                            onClick={() => onRevokePermission(user)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            disabled={!user.permissions || user.permissions.length === 0}
                          >
                            <Minus className="h-4 w-4" />
                            <span>Revoke Permission</span>
                          </button>
                          <button
                            onClick={() => onViewHistory(user)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <History className="h-4 w-4" />
                            <span>View History</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Alternative: Direct action buttons instead of dropdown */}
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onGrantPermission(user)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Grant Permission"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onRevokePermission(user)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Revoke Permission"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onViewHistory(user)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="View History"
                    >
                      <History className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

// Performance optimization: Only re-render when props actually change
UserPermissionList.displayName = 'UserPermissionList';

export default UserPermissionList;
