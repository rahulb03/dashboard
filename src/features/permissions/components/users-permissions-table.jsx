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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { flexRender } from '@tanstack/react-table';
import { DataTablePagination } from '@/components/ui/table/data-table-pagination';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormCardSkeleton from '@/components/form-card-skeleton';
import {
  Users, 
  UserPlus, 
  UserMinus,
  RefreshCw, 
  Search,
  Shield,
  MoreHorizontal
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

// Component to display permissions with expand/collapse
function PermissionsDisplay({ permissions }) {
  const [showAll, setShowAll] = useState(false);
  const displayLimit = 6;
  const shouldShowMore = permissions.length > displayLimit;
  const displayedPermissions = showAll ? permissions : permissions.slice(0, displayLimit);
  
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">Current Permissions ({permissions.length}):</p>
        {shouldShowMore && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAll(!showAll)}
            className="text-xs h-6 px-2"
          >
            {showAll ? 'View less' : `View ${permissions.length - displayLimit} more`}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {displayedPermissions.map((permission) => (
          <Badge key={permission.id} variant="outline" className="text-xs">
            {permission.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}

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
    meta: {
      variant: 'text',
      placeholder: 'Filter users...',
      label: 'Name'
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
          onClick={() => {
            // console.log('🎯 Selecting user from name cell:', user.name);
            dispatch(setSelectedUser(user));
          }}
        >
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
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div 
          className="text-sm cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
          onClick={() => {
            dispatch(setSelectedUser(user));
          }}
        >
          {user.email}
        </div>
      );
    }
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
    meta: {
      variant: 'select',
      label: 'Role',
      options: ROLE_OPTIONS
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
      return (
        <Badge variant="outline">
          {permissions.length} permissions
        </Badge>
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
            <DropdownMenuItem onClick={() => {
              router.push(`/dashboard/permissions/grant?userId=${user.id}&userName=${encodeURIComponent(user.name)}`);
            }}>
              <UserPlus className="mr-2 h-4 w-4" />
              Grant permission
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
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
      revokePermission: onRevokePermission,
      dispatch: dispatch,
      setSelectedUser: setSelectedUser
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
  // console.log('🔍 React Table Debug:', {
  //   dataLength: finalUsers.length,
  //   tableRows: table.getRowModel().rows.length,
  //   firstDataItem: finalUsers[0],
  //   visibleRows: table.getRowModel().rows.slice(0, 3).map(row => row.original),
  //   columnCount: table.getAllColumns().length,
  //   paginationState: table.getState().pagination,
  //   columnFilters: table.getState().columnFilters,
  //   allColumns: table.getAllColumns().map(col => ({ id: col.id, accessorKey: col.columnDef.accessorKey }))
  // });

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
            <PermissionsDisplay permissions={selectedUser.permissions} />
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <div className="h-8 w-[250px] bg-muted animate-pulse rounded" />
              <div className="h-8 w-[150px] bg-muted animate-pulse rounded" />
              <div className="h-8 w-[150px] bg-muted animate-pulse rounded" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-[80px] bg-muted animate-pulse rounded" />
              <div className="h-8 w-[140px] bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="rounded-md border">
            <div className="h-[400px] animate-pulse bg-muted/50" />
          </div>
        </div>
      )}
      
      {/* Always show table structure when not loading */}
      {!loading && (
        <div className="space-y-4">
          {/* Header with actions */}
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={(table.getColumn("name")?.getFilterValue()) ?? ""}
                  onChange={(event) =>
                    table.getColumn("name")?.setFilterValue(event.target.value)
                  }
                  className="pl-8"
                />
              </div>
              <Select 
                value={(table.getColumn("role")?.getFilterValue()) ?? "all"}
                onValueChange={(value) => 
                  table.getColumn("role")?.setFilterValue(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                Export Users
              </Button>
            </div>
          </div>
          
          {/* Custom Table with Shield icon for no results */}
          <div className='rounded-lg border'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className='text-center py-8'
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Shield className="h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">No users found</h3>
                        <p className="text-muted-foreground">
                          {finalUsers.length === 0
                            ? "No users are available for permission management."
                            : "No users match your current search criteria."
                          }
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <DataTablePagination table={table} />
        </div>
      )}
    </div>
  );
}