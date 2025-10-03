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
import { fetchPaymentsThunk } from '@/redux/payments/paymentThunks';
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
import { Search, CreditCard, FileText, Landmark, Download, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PaymentTable({ columns, onExport, onRefresh }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { payments, loading } = useSelector((state) => state.payments);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const table = useReactTable({
    data: payments || [],
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

  // Compute payment stats from filtered data
  const stats = (() => {
    const filteredRows = table.getFilteredRowModel().rows;
    const list = filteredRows.map(row => row.original);
    const totalAmount = list.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const membershipCount = list.filter(p => p.type === 'MEMBERSHIP').length;
    const documentFeeCount = list.filter(p => p.type === 'DOCUMENT_FEE').length;
    const loanFeeCount = list.filter(p => p.type === 'LOAN_FEE').length;
    return { totalAmount, membershipCount, documentFeeCount, loanFeeCount };
  })();

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Sum of all payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memberships</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.membershipCount}</div>
            <p className="text-xs text-muted-foreground">Total membership payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Document Fees</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documentFeeCount}</div>
            <p className="text-xs text-muted-foreground">Total document fee payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loan Fees</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.loanFeeCount}</div>
            <p className="text-xs text-muted-foreground">Total loan fee payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Header with filters and action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={(table.getColumn("name")?.getFilterValue()) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-8"
            />
          </div>
          
          {/* Payment Type Filter */}
          <Select 
            value={(table.getColumn("type")?.getFilterValue()) ?? "all"}
            onValueChange={(value) => 
              table.getColumn("type")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="MEMBERSHIP">Membership Fee</SelectItem>
              <SelectItem value="LOAN_FEE">Loan Fee</SelectItem>
              <SelectItem value="DOCUMENT_FEE">Document Fee</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Status Filter */}
          <Select 
            value={(table.getColumn("status")?.getFilterValue()) ?? "all"}
            onValueChange={(value) => 
              table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
              <SelectItem value="CREATED">Created</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onExport && onExport(table.getFilteredRowModel().rows.map(row => row.original))}
            disabled={!payments || payments.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Custom Table with CreditCard icon for no results */}
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
                    <CreditCard className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">No payments found</h3>
                    <p className="text-muted-foreground">
                      {(payments || []).length === 0
                        ? "No payments have been processed yet."
                        : "No payments match your current search criteria."
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