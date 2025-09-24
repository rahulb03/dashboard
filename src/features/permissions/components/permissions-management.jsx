'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield, 
  Users, 
  Settings, 
  Activity,
  RefreshCw,

  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import UsersPermissionsTable from './users-permissions-table';
import AvailablePermissionsTable from './available-permissions-table';

// Import Redux actions
import {
  fetchUsersWithPermissions,
  fetchAvailablePermissions,
} from '@/redux/permissions/permissionThunks';
import {
  setSelectedUser,
  
} from '@/redux/permissions/permissionSlice';

export default function PermissionsManagement() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { 
    users,
    availablePermissions,
    selectedUser,
    loading,
    error,
    successMessage,
  } = useSelector((state) => state.permissions);

  const [activeTab, setActiveTab] = useState('users');

  // Load initial data
  useEffect(() => {
    dispatch(fetchUsersWithPermissions());
    dispatch(fetchAvailablePermissions());
  }, [dispatch]);

  // Calculate stats from real data
  const stats = {
    totalUsers: users.length,
    totalPermissions: availablePermissions.totalPermissions || 0,
    totalCategories: availablePermissions.categories?.length || 0,
    activeUsers: users.filter(u => u.status === 'active').length
  };

  const handleRefresh = () => {
    dispatch(fetchUsersWithPermissions({ forceRefresh: true }));
    dispatch(fetchAvailablePermissions({ forceRefresh: true }));
  };

  const handleUserSelect = (user) => {
    dispatch(setSelectedUser(user));
  };
  
  const handleGrantPermission = (user) => {

    // Store selected user in Redux and navigate to grant page
    dispatch(setSelectedUser(user));
    const url = `/dashboard/permissions/grant?userId=${user.id}&userName=${encodeURIComponent(user.name)}`;
    router.push(url);
  };
  
  const handleRevokePermission = (user) => {
  
    // Store selected user in Redux and navigate to revoke page
    dispatch(setSelectedUser(user));
    const url = `/dashboard/permissions/revoke?userId=${user.id}&userName=${encodeURIComponent(user.name)}`;
    router.push(url);
  };
  



  // Remove the error state blocking - let the table handle it

  return (
    <div className="flex flex-col space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {(error.grant || error.revoke) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.grant || error.revoke}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              System users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPermissions}</div>
            <p className="text-xs text-muted-foreground">
              Available permissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permission Categories</CardTitle>
            <Settings className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Permission groups
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Management</CardTitle>
          <CardDescription>
            Grant and revoke permissions for users. Select a user to see their current permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" />
                Users & Permissions
              </TabsTrigger>
              <TabsTrigger value="permissions">
                <Shield className="mr-2 h-4 w-4" />
                Available Permissions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <UsersPermissionsTable
                users={users}
                onUserSelect={handleUserSelect}
                selectedUser={selectedUser}
                loading={loading.users}
                onGrantPermission={handleGrantPermission}
                onRevokePermission={handleRevokePermission}
              />
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <AvailablePermissionsTable
                availablePermissions={availablePermissions}
                loading={loading.permissions}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}