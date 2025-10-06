'use client';

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
import { useDispatch, useSelector } from 'react-redux';
import { fetchMembersThunk } from '@/redux/member/memberThunks';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Users, UserCog, Briefcase, Shield } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ListingModal from '../../components/skeleton/listingmodal';


export function MemberTable({ columns }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { members, loading } = useSelector((state) => state.member);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Calculate member statistics
  const memberStats = {
    total: members?.length || 0,
    admin: members?.filter(m => m.role === 'ADMIN').length || 0,
    manager: members?.filter(m => m.role === 'MANAGER').length || 0,
    employee: members?.filter(m => m.role === 'EMPLOYEE').length || 0,
  };

  useEffect(() => {
    // Only fetch if we don't have members data
    if (!members || members.length === 0) {
      dispatch(fetchMembersThunk({}));
    }
  }, [dispatch]);

  const table = useReactTable({
    data: members || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });

 if (loading) {
  return <ListingModal />;
}


  return (
    <div className="space-y-4">
      {/* Member Statistics Cards */}
      {members && members.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Members Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberStats.total}</div>
              <p className="text-xs text-muted-foreground">
                All members
              </p>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberStats.admin}</div>
              <p className="text-xs text-muted-foreground">
                Administrator role
              </p>
            </CardContent>
          </Card>

          {/* Manager Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Managers</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberStats.manager}</div>
              <p className="text-xs text-muted-foreground">
                Manager role
              </p>
            </CardContent>
          </Card>

          {/* Employee Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberStats.employee}</div>
              <p className="text-xs text-muted-foreground">
                Employee role
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header with filters and add button */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={(table.getColumn("name")?.getFilterValue()) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-8"
            />
          </div>
          
          {/* Role Filter */}
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
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
              <SelectItem value="EMPLOYEE">Employee</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Add Member Button */}
          <Button onClick={() => router.push('/dashboard/members/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Custom Table with Users icon for no results */}
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
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">No members found</h3>
                    <p className="text-muted-foreground">
                      {(members || []).length === 0
                        ? "No members have been added to the system yet."
                        : "No members match your current search criteria."
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
  );
}
