import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDataCache } from '../../hooks/useDataCache';
import {
  setFilters,
  setSelectedUser,
  clearSuccessMessage,
  clearErrors
} from '../../redux/permissions/permissionSlice';
import {
  fetchUsersWithPermissions,
  fetchAvailablePermissions
} from '../../redux/permissions/permissionThunks';
import UserPermissionList from './UserPermissionList';
import SimplePermissionModal from './SimplePermissionModal';
import PermissionHistory from './PermissionHistory';
import { Search, Filter, Users, Shield, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

const PermissionManagement = () => {
  const dispatch = useDispatch();
  const {
    availablePermissions: reduxAvailablePermissions,
    selectedUser,
    loading: reduxLoading,
    error: reduxError,
    successMessage,
    filters
  } = useSelector(state => state.permissions);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('grant'); // 'grant' or 'revoke'
  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  
  // Create fetch functions for useDataCache
  const fetchUsersFunction = useCallback(async (params = {}) => {
    const result = await dispatch(fetchUsersWithPermissions(params)).unwrap()
    return result
  }, [dispatch])
  
  const fetchPermissionsFunction = useCallback(async (params = {}) => {
    const result = await dispatch(fetchAvailablePermissions(params)).unwrap()
    return result
  }, [dispatch])
  
  // Use advanced caching for users data
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useDataCache(
    'users',
    fetchUsersFunction,
    { search: searchTerm, role: selectedRole },
    {
      enabled: true,
      refetchOnMount: false, // Don't refetch if we have cached data
      backgroundRefresh: true, // Allow background updates
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )
  
  // Extract users array from cached data structure
  // API returns { users: [...] } structure
  const users = usersData?.users || []
  
  // Use advanced caching for permissions data
  const {
    data: availablePermissions,
    loading: permissionsLoading,
    error: permissionsError,
    refetch: refetchPermissions,
  } = useDataCache(
    'permissions',
    fetchPermissionsFunction,
    {},
    {
      enabled: true,
      refetchOnMount: false, // Don't refetch if we have cached data
      backgroundRefresh: true, // Allow background updates
      staleTime: 10 * 60 * 1000, // 10 minutes (permissions change less frequently)
    }
  )
  
  // Combine loading states
  const loading = {
    users: usersLoading,
    permissions: permissionsLoading
  }
  
  // Combine error states
  const error = {
    users: usersError,
    permissions: permissionsError
  }

  // Data is now automatically fetched by useDataCache hooks
  // No need for manual useEffect fetch

  // Handle search with debounce - filters are automatically handled by useDataCache
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      dispatch(setFilters({ search: searchTerm, role: selectedRole }));
      // useDataCache will automatically refetch when params change
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedRole, dispatch]);
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleRefresh = () => {
    refetchUsers(true); // Force refresh
    refetchPermissions(true); // Force refresh
  };

  const handleUserSelect = (user) => {
    dispatch(setSelectedUser(user));
  };

  const handleGrantPermission = (user) => {
    handleUserSelect(user);
    setModalMode('grant');
    setShowModal(true);
  };

  const handleRevokePermission = (user) => {
    handleUserSelect(user);
    setModalMode('revoke');
    setShowModal(true);
  };

  const handleViewHistory = (user) => {
    handleUserSelect(user);
    setShowHistory(true);
  };

  const handleModalClose = (shouldRefresh) => {
    setShowModal(false);
    if (shouldRefresh) {
      refetchUsers(true); // Force refresh users data
    }
  };

  const handleHistoryClose = () => {
    setShowHistory(false);
    dispatch(setSelectedUser(null));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">Permission Management</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading.users}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading.users ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
          <p className="text-gray-600">Manage user permissions and access controls</p>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium">Success</p>
              <p className="text-green-700 text-sm mt-1">{successMessage}</p>
            </div>
          </div>
        )}

        {error.users && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm mt-1">{error.users}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{users?.length || 0}</p>
              </div>
              <Users className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Available Permissions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {availablePermissions?.totalPermissions || 0}
                </p>
              </div>
              <Shield className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Permission Categories</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {availablePermissions?.categories?.length || 0}
                </p>
              </div>
              <Filter className="h-10 w-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 pr-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="">🔍 All Roles</option>
                <option value="admin">👑 Administrator</option>
                <option value="manager">👔 Manager</option>
                <option value="employee">👤 Employee</option>
                <option value="user">👥 Standard User</option>
                <option value="guest">🚶 Guest</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <UserPermissionList
          users={users || []}
          loading={loading.users}
          onGrantPermission={handleGrantPermission}
          onRevokePermission={handleRevokePermission}
          onViewHistory={handleViewHistory}
        />

        {/* Permission Modal */}
        {showModal && (
          <SimplePermissionModal
            isOpen={showModal}
            onClose={handleModalClose}
            mode={modalMode}
            user={selectedUser}
            availablePermissions={availablePermissions}
          />
        )}

        {/* Permission History Modal */}
        {showHistory && (
          <PermissionHistory
            isOpen={showHistory}
            onClose={handleHistoryClose}
            user={selectedUser}
          />
        )}
      </div>
    </div>
  );
};

export default PermissionManagement;