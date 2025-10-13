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
import { fetchMembershipsThunk } from '@/redux/membership/membershipThunks';
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
import { Plus, Search, Users, Shield, CheckCircle, XCircle, Clock, Ban } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ListingModal from '../../components/skeleton/listingmodal';


export function MembershipTable({ columns }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { memberships, loading } = useSelector((state) => state.membership);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Calculate membership statistics
  const membershipStats = {
    total: memberships?.length || 0,
    active: memberships?.filter(m => m.status === 'ACTIVE').length || 0,
    cancelled: memberships?.filter(m => m.status === 'CANCELLED').length || 0,
    expired: memberships?.filter(m => m.status === 'EXPIRED').length || 0,
    suspended: memberships?.filter(m => m.status === 'SUSPENDED').length || 0,
  };

  useEffect(() => {
    // Only fetch if we don't have memberships data
    if (!memberships || memberships.length === 0) {
      // console.log('📡 Fetching memberships on mount');
      dispatch(fetchMembershipsThunk({}));
    } else {
      // console.log('✅ Already have', memberships.length, 'memberships - skipping fetch');
    }
  }, [dispatch]);

  const table = useReactTable({
    data: memberships || [],
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
      {/* Membership Statistics Cards */}
      {memberships && memberships.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Total Memberships Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Memberships</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{membershipStats.total}</div>
              <p className="text-xs text-muted-foreground">
                All memberships
              </p>
            </CardContent>
          </Card>

          {/* Active Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{membershipStats.active}</div>
              <p className="text-xs text-muted-foreground">
                Active memberships
              </p>
            </CardContent>
          </Card>

          {/* Cancelled Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{membershipStats.cancelled}</div>
              <p className="text-xs text-muted-foreground">
                Cancelled memberships
              </p>
            </CardContent>
          </Card>

          {/* Expired Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{membershipStats.expired}</div>
              <p className="text-xs text-muted-foreground">
                Expired memberships
              </p>
            </CardContent>
          </Card>

          {/* Suspended Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspended</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{membershipStats.suspended}</div>
              <p className="text-xs text-muted-foreground">
                Suspended memberships
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
              placeholder="Search memberships..."
              value={(table.getColumn("user")?.getFilterValue()) ?? ""}
              onChange={(event) =>
                table.getColumn("user")?.setFilterValue(event.target.value)
              }
              className="pl-8"
            />
          </div>
          
          {/* Status Filter */}
          <Select 
            value={(table.getColumn("status")?.getFilterValue()) ?? "all"}
            onValueChange={(value) => 
              table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status">
                {(() => {
                  const value = table.getColumn("status")?.getFilterValue();
                  if (!value) return "All Status";
                  if (value === "ACTIVE") return "Active";
                  if (value === "EXPIRED") return "Expired";
                  if (value === "CANCELLED") return "Cancelled";
                  if (value === "SUSPENDED") return "Suspended";
                  return "All Status";
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Add Membership Button */}
          <Button onClick={() => router.push('/dashboard/memberships/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Membership
          </Button>
        </div>
      </div>

      {/* Custom Table with Certificate icon for no results */}
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
                    <h3 className="text-lg font-semibold">No memberships found</h3>
                    <p className="text-muted-foreground">
                      {(memberships || []).length === 0
                        ? "No memberships have been created yet."
                        : "No memberships match your current search criteria."
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