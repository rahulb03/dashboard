'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setSelectedUser } from '@/redux/permissions/permissionSlice';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { 
  MoreHorizontal, 
  Shield, 
  Users, 
  UserPlus, 
  UserMinus,
  Eye,
  History,
  Search,
  RefreshCw
} from 'lucide-react';

// Role options for filtering
const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'USER', label: 'User' }
];

// Status options for filtering
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' }
];

// Moved columns inside component to access hooks

export default function UsersPermissionsTable({ 
  users = [], 
  onUserSelect, 
  selectedUser, 
  loading = false,
  onGrantPermission,
  onRevokePermission
}) {
  // Handle different data structures that might be passed
  const normalizedUsers = Array.isArray(users) ? users : 
                         users?.users ? users.users : 
                         users?.data ? users.data : [];
  
  // Use the normalized users directly
  const finalUsers = normalizedUsers;
  
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [grantingPermission, setGrantingPermission] = useState(null); // Store user ID being processed
  const [revokingPermission, setRevokingPermission] = useState(null); // Store user ID being processed
  const router = useRouter();
  const dispatch = useDispatch();
  
  const columns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="font-medium">
            {user.name}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{row.original.email}</div>
    )
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <Badge variant={role === 'ADMIN' ? 'default' : role === 'MANAGER' ? 'secondary' : 'outline'}>
          {role}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge 
          variant={status === 'active' ? 'default' : status === 'inactive' ? 'secondary' : 'destructive'}
          className={status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
        >
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'permissions',
    header: 'Permissions',
    cell: ({ row }) => {
      const permissions = row.original.permissions || [];
      const onUserSelect = row.table?.options?.meta?.onUserSelect;
      return (
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {permissions.length} permissions
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Eye button clicked for user:', row.original);
              if (onUserSelect) {
                onUserSelect(row.original);
              }
            }}
            title="View permissions"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    enableSorting: false
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
              Copy email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => row.table?.options?.meta?.onUserSelect?.(user)}>
              <Eye className="mr-2 h-4 w-4" />
              View permissions
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              console.log('🚀 Grant permission clicked for user:', user);
              dispatch(setSelectedUser(user));
              router.push(`/dashboard/permissions/grant?userId=${user.id}&userName=${encodeURIComponent(user.name)}`);
            }}>
              <UserPlus className="mr-2 h-4 w-4" />
              Grant permission
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              console.log('🚀 Revoke permission clicked for user:', user);
              dispatch(setSelectedUser(user));
              router.push(`/dashboard/permissions/revoke?userId=${user.id}&userName=${encodeURIComponent(user.name)}`);
            }}>
              <UserMinus className="mr-2 h-4 w-4" />
              Revoke permission
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false
  }
  ];
  
  // Enhanced debugging
  console.log('🔍 UsersPermissionsTable Debug:', {
    'Raw users prop': users,
    'users type': typeof users,
    'users isArray': Array.isArray(users),
    'normalizedUsers': normalizedUsers,
    'normalizedUsers length': normalizedUsers.length,
    'finalUsers': finalUsers,
    'finalUsers length': finalUsers.length,
    'first normalized user': normalizedUsers[0],
    'first final user': finalUsers[0],
    'loading state': loading,
    'onGrantPermission': onGrantPermission,
    'onRevokePermission': onRevokePermission,
    'onUserSelect': onUserSelect
  });
  

  const table = useReactTable({
    data: finalUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id?.toString() || Math.random().toString(),
    enableRowSelection: true,
    enableColumnFilters: true,
    enableSorting: true,
    meta: {
      router,
      onUserSelect,
      selectedUser,
      grantPermission: onGrantPermission,
      revokePermission: onRevokePermission
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10
      }
    }
  });

  // Debug the table state
  console.log('🔍 React Table Debug:', {
    dataLength: finalUsers.length,
    tableRows: table.getRowModel().rows.length,
    firstDataItem: finalUsers[0],
    visibleRows: table.getRowModel().rows.slice(0, 3).map(row => row.original),
    columnCount: table.getAllColumns().length,
    paginationState: table.getState().pagination,
    columnFilters: table.getState().columnFilters,
    allColumns: table.getAllColumns().map(col => ({ id: col.id, accessorKey: col.columnDef.accessorKey }))
  });

  return (
    <div className="space-y-4">

      {/* Selected User Details */}
      {selectedUser && (
        <div className="rounded-lg border p-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                <AvatarFallback>
                  {selectedUser.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{selectedUser.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{selectedUser.role}</Badge>
              <Badge variant="secondary">
                {selectedUser.permissions?.length || 0} permissions
              </Badge>
            </div>
          </div>
          
          {selectedUser.permissions && selectedUser.permissions.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Current Permissions:</p>
              <div className="flex flex-wrap gap-1">
                {selectedUser.permissions.slice(0, 5).map((permission) => (
                  <Badge key={permission.id} variant="outline" className="text-xs">
                    {permission.name}
                  </Badge>
                ))}
                {selectedUser.permissions.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedUser.permissions.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add debug info */}
      {normalizedUsers.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-8 text-center border rounded-lg">
          <Users className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            There are no users in the system or they failed to load.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      )}
      
      {loading && (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        </div>
      )}
      
      {!loading && finalUsers.length > 0 && (
        <DataTable table={table}>
          <DataTableToolbar 
            table={table}
            filterFields={[
              {
                id: 'name',
                placeholder: 'Filter users...',
                type: 'text'
              },
              {
                id: 'role',
                title: 'Role',
                options: ROLE_OPTIONS
              },
              {
                id: 'status',
                title: 'Status',
                options: STATUS_OPTIONS
              }
            ]}
          >
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Export Users
              </Button>
              {Object.keys(rowSelection).length > 0 && (
                <Button variant="outline" size="sm">
                  Bulk Actions ({Object.keys(rowSelection).length})
                </Button>
              )}
            </div>
          </DataTableToolbar>
        </DataTable>
      )}
    </div>
  );
}