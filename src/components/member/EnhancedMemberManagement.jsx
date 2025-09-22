import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Users, 
  UserCheck, 
  Shield, 
  Crown,
  Briefcase,
  Search, 
  Plus, 
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';

// Import our enhanced UI components
import Card, { StatsCard, CardHeader, CardTitle, CardDescription } from '../ui/EnhancedCard';
import Button, { IconButton } from '../ui/EnhancedButton';
import Modal from '../ui/Modal';
import Input, { SearchInput, Select } from '../ui/EnhancedInput';

// Import existing hooks
import { useDataCache } from '../../hooks/useDataCache';

/**
 * Enhanced Member Management - Clean, modern, light design
 * Professional admin interface with excellent UX
 */

const EnhancedMemberManagement = () => {
  const dispatch = useDispatch();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'cards' or 'table'
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Enhanced data fetching with cache
  const { 
    data: membersData, 
    loading: membersLoading, 
    refetch: refetchMembers,
    cacheHitRate 
  } = useDataCache('members', async () => {
    // Your existing fetch function
    const response = await fetch('/api/members');
    return response.json();
  });

  // Process data with memoization for performance
  const processedData = useMemo(() => {
    if (!membersData) return { members: [], stats: {} };

    const members = Array.isArray(membersData) ? membersData : membersData.members || [];
    
    // Filter members based on search and role
    const filteredMembers = members.filter(member => {
      const matchesSearch = !searchQuery || 
        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone?.includes(searchQuery);
      
      const matchesRole = selectedRole === 'all' || member.role === selectedRole;
      
      return matchesSearch && matchesRole;
    });

    // Calculate enhanced statistics
    const stats = {
      totalMembers: members.length,
      filteredMembers: filteredMembers.length,
      admins: members.filter(m => m.role === 'ADMIN').length,
      managers: members.filter(m => m.role === 'MANAGER').length,
      employees: members.filter(m => m.role === 'EMPLOYEE').length,
      users: members.filter(m => m.role === 'USER').length,
      activeMembers: members.filter(m => m.status === 'active').length,
      roles: [...new Set(members.map(m => m.role).filter(Boolean))]
    };

    return { members: filteredMembers, stats, allMembers: members };
  }, [membersData, searchQuery, selectedRole]);

  // Role options for filtering
  const roleOptions = useMemo(() => [
    { value: 'all', label: 'All Roles' },
    { value: 'ADMIN', label: 'Admins' },
    { value: 'MANAGER', label: 'Managers' },
    { value: 'EMPLOYEE', label: 'Employees' },
    { value: 'USER', label: 'Users' }
  ], []);

  // Handle member actions
  const handleEditMember = (member) => {
    setSelectedMember(member);
    setShowAddModal(true);
  };

  const handleViewMember = (member) => {
    console.log('View member:', member.name);
  };

  const handleDeleteMember = (member) => {
    console.log('Delete member:', member.name);
  };

  // Track user interactions for predictive caching
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.dataCache) {
      window.dataCache.trackUserAction('member_management_view', {
        membersCount: processedData.members.length,
        selectedRole,
        searchQuery: searchQuery ? 'has_search' : 'no_search'
      });
    }
  }, [processedData.members.length, selectedRole, searchQuery]);

  if (membersLoading && !membersData) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Clean Page Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Member Management
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    Manage system users and their permissions
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Cache performance indicator (development only) */}
              {process.env.NODE_ENV === 'development' && cacheHitRate !== undefined && (
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg font-medium">
                  Cache: {cacheHitRate.toFixed(1)}%
                </div>
              )}
              
              <Button
                variant="secondary"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={refetchMembers}
                loading={membersLoading}
                className="bg-white border-gray-300"
              >
                Refresh
              </Button>
              
              <Button
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Member
              </Button>
            </div>
          </div>
        </div>

        {/* Beautiful Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatsCard
            title="Total Members"
            value={processedData.stats.totalMembers || 0}
            change={processedData.stats.filteredMembers !== processedData.stats.totalMembers ? 
              `${processedData.stats.filteredMembers} shown` : null}
            changeType="neutral"
            icon={<Users className="h-6 w-6" />}
            color="primary"
            className="bg-white border border-gray-200"
          />
          
          <StatsCard
            title="Admins"
            value={processedData.stats.admins || 0}
            icon={<Crown className="h-6 w-6" />}
            color="error"
            className="bg-white border border-gray-200"
          />
          
          <StatsCard
            title="Managers"
            value={processedData.stats.managers || 0}
            icon={<Shield className="h-6 w-6" />}
            color="success"
            className="bg-white border border-gray-200"
          />
          
          <StatsCard
            title="Employees"
            value={processedData.stats.employees || 0}
            icon={<Briefcase className="h-6 w-6" />}
            color="warning"
            className="bg-white border border-gray-200"
          />
          
          <StatsCard
            title="Users"
            value={processedData.stats.users || 0}
            icon={<UserCheck className="h-6 w-6" />}
            color="primary"
            className="bg-white border border-gray-200"
          />
        </div>

        {/* Clean Search and Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Enhanced Search */}
            <div className="flex-1">
              <SearchInput
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                className="w-full"
              />
            </div>
            
            {/* Role Filter */}
            <div className="w-full sm:w-48">
              <Select
                options={roleOptions}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                placeholder="All Roles"
                className="w-full"
              />
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>

        {/* Members Display */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  System Members
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {processedData.members.length} of {processedData.stats.totalMembers} members
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {viewMode === 'table' ? (
              <MemberTableView 
                members={processedData.members}
                onEdit={handleEditMember}
                onView={handleViewMember}
                onDelete={handleDeleteMember}
              />
            ) : (
              <MemberCardsView 
                members={processedData.members}
                onEdit={handleEditMember}
                onView={handleViewMember}
                onDelete={handleDeleteMember}
              />
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        <AddMemberModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedMember(null);
          }}
          member={selectedMember}
          onSuccess={() => {
            refetchMembers();
          }}
        />
      </div>
    </div>
  );
};

// Clean Loading State
const LoadingState = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Search Section Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex gap-4">
          <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      
      {/* Table Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Clean Member Table View
const MemberTableView = ({ members, onEdit, onView, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Member
          </th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Email
          </th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Mobile
          </th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Role
          </th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Created
          </th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {members.map((member) => (
          <tr key={member.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {member.name?.charAt(0)?.toUpperCase() || 'M'}
                  </span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{member.name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">ID: {member.id}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center text-sm text-gray-900">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                {member.email || 'No email'}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center text-sm text-gray-900">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                {member.phone || 'No phone'}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <RoleBadge role={member.role} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center text-sm text-gray-900">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center space-x-2">
                <IconButton
                  size="sm"
                  variant="ghost"
                  onClick={() => onView(member)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Eye className="h-4 w-4" />
                </IconButton>
                <IconButton
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(member)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Edit className="h-4 w-4" />
                </IconButton>
                <IconButton
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(member)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Member Cards View (simplified)
const MemberCardsView = ({ members, onEdit, onView, onDelete }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {members.map((member) => (
      <div key={member.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {member.name?.charAt(0)?.toUpperCase() || 'M'}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{member.name || 'N/A'}</h3>
              <p className="text-sm text-gray-500">ID: {member.id}</p>
            </div>
          </div>
          <RoleBadge role={member.role} />
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            {member.email || 'No email'}
          </div>
          <div className="flex items-center text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            {member.phone || 'No phone'}
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
          <IconButton size="sm" variant="ghost" onClick={() => onView(member)}>
            <Eye className="h-4 w-4" />
          </IconButton>
          <IconButton size="sm" variant="ghost" onClick={() => onEdit(member)}>
            <Edit className="h-4 w-4" />
          </IconButton>
          <IconButton size="sm" variant="ghost" onClick={() => onDelete(member)}>
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    ))}
  </div>
);

// Role Badge Component
const RoleBadge = ({ role }) => {
  const roleStyles = {
    ADMIN: 'bg-red-100 text-red-800 border-red-200',
    MANAGER: 'bg-green-100 text-green-800 border-green-200',
    EMPLOYEE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    USER: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${roleStyles[role] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {role || 'N/A'}
    </span>
  );
};

// Add/Edit Member Modal (placeholder)
const AddMemberModal = ({ isOpen, onClose, member, onSuccess }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={member ? 'Edit Member' : 'Add Member'} size="lg">
    <div className="space-y-4">
      <p>Add/Edit member modal content goes here...</p>
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onSuccess}>
          {member ? 'Update' : 'Add'} Member
        </Button>
      </div>
    </div>
  </Modal>
);

export default EnhancedMemberManagement;