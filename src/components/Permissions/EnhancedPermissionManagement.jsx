// import React, { useState, useMemo } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { 
//   Shield, 
//   Users, 
//   UserCheck, 
//   Search, 
//   Plus, 
//   Filter,
//   MoreVertical,
//   Eye,
//   Edit,
//   Trash2,
//   RefreshCw
// } from 'lucide-react';

// // Import our enhanced UI components
// import Card, { StatsCard, PermissionCard, CardHeader, CardTitle, CardDescription } from '../ui/EnhancedCard';
// import Button, { IconButton } from '../ui/EnhancedButton';
// import Modal, { ConfirmModal } from '../ui/Modal';
// import Input, { SearchInput, FormGroup, Select } from '../ui/EnhancedInput';

// // Import existing hooks (enhanced with new features)
// import { useDataCache } from '../../hooks/useDataCache';

// /**
//  * Enhanced Permission Management - Modern, professional design
//  * Features: Advanced filtering, bulk operations, responsive design
//  */

// const EnhancedPermissionManagement = () => {
//   const dispatch = useDispatch();
  
//   // Enhanced state management
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedRole, setSelectedRole] = useState('all');
//   const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [showGrantModal, setShowGrantModal] = useState(false);
//   const [showRevokeModal, setShowRevokeModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [bulkOperation, setBulkOperation] = useState(null);

//   // Enhanced data fetching with cache
//   const { 
//     data: usersData, 
//     loading: usersLoading, 
//     refetch: refetchUsers,
//     cacheHitRate 
//   } = useDataCache('users', async () => {
//     // Your existing fetch function here
//     const response = await fetch('/api/users-with-permissions');
//     return response.json();
//   });

//   const { 
//     data: permissionsData, 
//     loading: permissionsLoading 
//   } = useDataCache('permissions', async () => {
//     const response = await fetch('/api/permissions');
//     return response.json();
//   });

//   // Process data with memoization for performance
//   const processedData = useMemo(() => {
//     if (!usersData) return { users: [], stats: {} };

//     const users = Array.isArray(usersData) ? usersData : usersData.users || [];
    
//     // Filter users based on search and role
//     const filteredUsers = users.filter(user => {
//       const matchesSearch = !searchQuery || 
//         user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
//       const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      
//       return matchesSearch && matchesRole;
//     });

//     // Calculate enhanced statistics
//     const stats = {
//       totalUsers: users.length,
//       filteredUsers: filteredUsers.length,
//       totalPermissions: permissionsData?.length || 0,
//       activeUsers: users.filter(u => u.status === 'active').length,
//       roles: [...new Set(users.map(u => u.role).filter(Boolean))],
//       averagePermissions: users.length > 0 ? 
//         Math.round(users.reduce((acc, user) => acc + (user.permissions?.length || 0), 0) / users.length) : 0
//     };

//     return { users: filteredUsers, stats, allUsers: users };
//   }, [usersData, permissionsData, searchQuery, selectedRole]);

//   // Role options for filtering
//   const roleOptions = useMemo(() => [
//     { value: 'all', label: 'All Roles' },
//     ...processedData.stats.roles?.map(role => ({ 
//       value: role, 
//       label: role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
//     })) || []
//   ], [processedData.stats.roles]);

//   // Handle user selection for bulk operations
//   const handleUserSelection = (userId, selected) => {
//     setSelectedUsers(prev => 
//       selected 
//         ? [...prev, userId]
//         : prev.filter(id => id !== userId)
//     );
//   };

//   // Handle bulk operations
//   const handleBulkOperation = (operation) => {
//     if (selectedUsers.length === 0) return;
//     setBulkOperation(operation);
    
//     switch (operation) {
//       case 'grant':
//         setShowGrantModal(true);
//         break;
//       case 'revoke':
//         setShowRevokeModal(true);
//         break;
//       default:
//         break;
//     }
//   };

//   // Handle individual user actions
//   const handleEditPermissions = (user) => {
//     setSelectedUser(user);
//     setShowGrantModal(true);
//   };

//   const handleViewProfile = (user) => {
//     // Navigate to user profile or open profile modal
//     console.log('View profile for:', user.name);
//   };

//   // Track user interactions for predictive caching
//   React.useEffect(() => {
//     if (typeof window !== 'undefined' && window.dataCache) {
//       window.dataCache.trackUserAction('permission_management_view', {
//         usersCount: processedData.users.length,
//         selectedRole,
//         searchQuery: searchQuery ? 'has_search' : 'no_search'
//       });
//     }
//   }, [processedData.users.length, selectedRole, searchQuery]);

//   if (usersLoading && !usersData) {
//     return <LoadingState />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
//       {/* Enhanced Page Header */}
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//         <div>
//           <div className="flex items-center space-x-3">
//             <div className="p-2 bg-primary-100 rounded-lg">
//               <Shield className="h-6 w-6 text-primary-600" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Permission Management
//               </h1>
//               <p className="text-gray-600 mt-1">
//                 Manage user permissions and access controls across your system
//               </p>
//             </div>
//           </div>
//         </div>
        
//         <div className="flex items-center space-x-3">
//           {/* Cache performance indicator (development only) */}
//           {process.env.NODE_ENV === 'development' && cacheHitRate !== undefined && (
//             <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//               Cache: {cacheHitRate.toFixed(1)}%
//             </div>
//           )}
          
//           <Button
//             variant="outline"
//             leftIcon={<RefreshCw className="h-4 w-4" />}
//             onClick={refetchUsers}
//             loading={usersLoading}
//           >
//             Refresh
//           </Button>
          
//           <Button
//             variant="primary"
//             leftIcon={<Plus className="h-4 w-4" />}
//             onClick={() => setShowGrantModal(true)}
//           >
//             Grant Permissions
//           </Button>
//         </div>
//       </div>

//       {/* Enhanced Statistics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatsCard
//           title="Total Users"
//           value={processedData.stats.totalUsers}
//           change={processedData.stats.filteredUsers !== processedData.stats.totalUsers ? 
//             `${processedData.stats.filteredUsers} filtered` : null}
//           changeType="neutral"
//           icon={<Users className="h-6 w-6" />}
//           color="primary"
//         />
        
//         <StatsCard
//           title="Available Permissions"
//           value={processedData.stats.totalPermissions}
//           icon={<Shield className="h-6 w-6" />}
//           color="success"
//         />
        
//         <StatsCard
//           title="Active Users"
//           value={processedData.stats.activeUsers}
//           change={`${Math.round((processedData.stats.activeUsers / processedData.stats.totalUsers) * 100)}% of total`}
//           changeType="positive"
//           icon={<UserCheck className="h-6 w-6" />}
//           color="success"
//         />
        
//         <StatsCard
//           title="Avg Permissions"
//           value={processedData.stats.averagePermissions}
//           icon={<Shield className="h-6 w-6" />}
//           color="gray"
//         />
//       </div>

//       {/* Enhanced Filters and Search */}
//       <Card>
//         <CardHeader>
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <CardTitle>User Permissions</CardTitle>
//               <CardDescription>
//                 Showing {processedData.users.length} of {processedData.stats.totalUsers} users
//               </CardDescription>
//             </div>
            
//             <div className="flex items-center space-x-3">
//               {/* View Mode Toggle */}
//               <div className="flex bg-gray-100 rounded-lg p-1">
//                 <button
//                   onClick={() => setViewMode('cards')}
//                   className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                     viewMode === 'cards' 
//                       ? 'bg-white text-gray-900 shadow-sm' 
//                       : 'text-gray-600 hover:text-gray-900'
//                   }`}
//                 >
//                   Cards
//                 </button>
//                 <button
//                   onClick={() => setViewMode('table')}
//                   className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                     viewMode === 'table' 
//                       ? 'bg-white text-gray-900 shadow-sm' 
//                       : 'text-gray-600 hover:text-gray-900'
//                   }`}
//                 >
//                   Table
//                 </button>
//               </div>
//             </div>
//           </div>
//         </CardHeader>
        
//         <div className="p-6 pt-0">
//           <div className="flex flex-col sm:flex-row gap-4 mb-6">
//             {/* Enhanced Search */}
//             <div className="flex-1">
//               <SearchInput
//                 placeholder="Search users by name or email..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onClear={() => setSearchQuery('')}
//               />
//             </div>
            
//             {/* Role Filter */}
//             <div className="w-full sm:w-48">
//               <Select
//                 options={roleOptions}
//                 value={selectedRole}
//                 onChange={(e) => setSelectedRole(e.target.value)}
//                 placeholder="Filter by role"
//               />
//             </div>
//           </div>

//           {/* Bulk Operations Bar */}
//           {selectedUsers.length > 0 && (
//             <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <span className="text-sm font-medium text-primary-700">
//                     {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
//                   </span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => handleBulkOperation('grant')}
//                   >
//                     Grant Permissions
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => handleBulkOperation('revoke')}
//                   >
//                     Revoke Permissions
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="ghost"
//                     onClick={() => setSelectedUsers([])}
//                   >
//                     Clear Selection
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Users Display */}
//           {viewMode === 'cards' ? (
//             <UserCardsView 
//               users={processedData.users}
//               onEditPermissions={handleEditPermissions}
//               onViewProfile={handleViewProfile}
//               selectedUsers={selectedUsers}
//               onUserSelection={handleUserSelection}
//             />
//           ) : (
//             <UserTableView 
//               users={processedData.users}
//               onEditPermissions={handleEditPermissions}
//               onViewProfile={handleViewProfile}
//               selectedUsers={selectedUsers}
//               onUserSelection={handleUserSelection}
//             />
//           )}
//         </div>
//       </Card>

//       {/* Modals */}
//       <GrantPermissionModal
//         isOpen={showGrantModal}
//         onClose={() => {
//           setShowGrantModal(false);
//           setSelectedUser(null);
//           setBulkOperation(null);
//         }}
//         user={selectedUser}
//         users={bulkOperation ? selectedUsers.map(id => 
//           processedData.allUsers.find(u => u.id === id)
//         ).filter(Boolean) : []}
//         permissions={permissionsData || []}
//         onSuccess={() => {
//           refetchUsers();
//           setSelectedUsers([]);
//         }}
//       />

//       <RevokePermissionModal
//         isOpen={showRevokeModal}
//         onClose={() => {
//           setShowRevokeModal(false);
//           setBulkOperation(null);
//         }}
//         users={selectedUsers.map(id => 
//           processedData.allUsers.find(u => u.id === id)
//         ).filter(Boolean)}
//         onSuccess={() => {
//           refetchUsers();
//           setSelectedUsers([]);
//         }}
//       />
//       </div>
//     </div>
//   );
// };

// // Enhanced Loading State
// const LoadingState = () => (
//   <div className="space-y-6">
//     <div className="flex items-center justify-between">
//       <div className="space-y-2">
//         <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
//         <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
//       </div>
//       <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
//     </div>
    
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//       {[...Array(4)].map((_, i) => (
//         <Card key={i} className="p-6">
//           <div className="animate-pulse space-y-3">
//             <div className="h-4 bg-gray-200 rounded w-20"></div>
//             <div className="h-8 bg-gray-200 rounded w-16"></div>
//             <div className="h-3 bg-gray-200 rounded w-24"></div>
//           </div>
//         </Card>
//       ))}
//     </div>
    
//     <Card className="p-6">
//       <div className="animate-pulse space-y-6">
//         <div className="flex justify-between">
//           <div className="space-y-2">
//             <div className="h-6 bg-gray-200 rounded w-32"></div>
//             <div className="h-4 bg-gray-200 rounded w-48"></div>
//           </div>
//         </div>
//         <div className="space-y-4">
//           {[...Array(5)].map((_, i) => (
//             <div key={i} className="h-16 bg-gray-200 rounded"></div>
//           ))}
//         </div>
//       </div>
//     </Card>
//   </div>
// );

// // User Cards View Component
// const UserCardsView = ({ users, onEditPermissions, onViewProfile, selectedUsers, onUserSelection }) => (
//   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//     {users.map((user) => (
//       <div key={user.id} className="relative">
//         {/* Selection Checkbox */}
//         <div className="absolute top-4 left-4 z-10">
//           <input
//             type="checkbox"
//             checked={selectedUsers.includes(user.id)}
//             onChange={(e) => onUserSelection(user.id, e.target.checked)}
//             className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
//           />
//         </div>
        
//         <PermissionCard
//           user={user}
//           permissions={user.permissions || []}
//           onEditPermissions={onEditPermissions}
//           onViewProfile={onViewProfile}
//           className="pt-12"
//         />
//       </div>
//     ))}
//   </div>
// );

// // User Table View Component (simplified for now)
// const UserTableView = ({ users, onEditPermissions, onViewProfile, selectedUsers, onUserSelection }) => (
//   <div className="overflow-x-auto">
//     <table className="min-w-full divide-y divide-gray-200">
//       <thead className="bg-gray-50">
//         <tr>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//             <input
//               type="checkbox"
//               checked={selectedUsers.length === users.length && users.length > 0}
//               onChange={(e) => {
//                 if (e.target.checked) {
//                   users.forEach(user => onUserSelection(user.id, true));
//                 } else {
//                   users.forEach(user => onUserSelection(user.id, false));
//                 }
//               }}
//               className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
//             />
//           </th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//             User
//           </th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//             Role
//           </th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//             Permissions
//           </th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//             Actions
//           </th>
//         </tr>
//       </thead>
//       <tbody className="bg-white divide-y divide-gray-200">
//         {users.map((user) => (
//           <tr key={user.id} className="hover:bg-gray-50">
//             <td className="px-6 py-4 whitespace-nowrap">
//               <input
//                 type="checkbox"
//                 checked={selectedUsers.includes(user.id)}
//                 onChange={(e) => onUserSelection(user.id, e.target.checked)}
//                 className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
//               />
//             </td>
//             <td className="px-6 py-4 whitespace-nowrap">
//               <div className="flex items-center">
//                 <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
//                   <span className="text-primary-600 font-medium text-sm">
//                     {user.name?.charAt(0)?.toUpperCase() || 'U'}
//                   </span>
//                 </div>
//                 <div className="ml-4">
//                   <div className="text-sm font-medium text-gray-900">{user.name}</div>
//                   <div className="text-sm text-gray-500">{user.email}</div>
//                 </div>
//               </div>
//             </td>
//             <td className="px-6 py-4 whitespace-nowrap">
//               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//                 {user.role}
//               </span>
//             </td>
//             <td className="px-6 py-4 whitespace-nowrap">
//               <span className="text-sm text-gray-900">
//                 {user.permissions?.length || 0} permissions
//               </span>
//             </td>
//             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//               <div className="flex items-center space-x-2">
//                 <IconButton
//                   size="sm"
//                   variant="ghost"
//                   onClick={() => onViewProfile(user)}
//                 >
//                   <Eye className="h-4 w-4" />
//                 </IconButton>
//                 <IconButton
//                   size="sm"
//                   variant="ghost"
//                   onClick={() => onEditPermissions(user)}
//                 >
//                   <Edit className="h-4 w-4" />
//                 </IconButton>
//               </div>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );

// // Placeholder modal components (to be implemented)
// const GrantPermissionModal = ({ isOpen, onClose, user, users, permissions, onSuccess }) => (
//   <Modal isOpen={isOpen} onClose={onClose} title="Grant Permissions" size="lg">
//     <div className="space-y-4">
//       <p>Grant permission modal content goes here...</p>
//       <div className="flex justify-end space-x-3">
//         <Button variant="secondary" onClick={onClose}>Cancel</Button>
//         <Button variant="primary" onClick={onSuccess}>Grant</Button>
//       </div>
//     </div>
//   </Modal>
// );

// const RevokePermissionModal = ({ isOpen, onClose, users, onSuccess }) => (
//   <Modal isOpen={isOpen} onClose={onClose} title="Revoke Permissions" size="lg">
//     <div className="space-y-4">
//       <p>Revoke permission modal content goes here...</p>
//       <div className="flex justify-end space-x-3">
//         <Button variant="secondary" onClick={onClose}>Cancel</Button>
//         <Button variant="danger" onClick={onSuccess}>Revoke</Button>
//       </div>
//     </div>
//   </Modal>
// );

// export default EnhancedPermissionManagement;