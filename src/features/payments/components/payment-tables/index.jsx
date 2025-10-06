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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentConfigsThunk } from '@/redux/payments/paymentConfigThunks';
import { IconPlus } from '@tabler/icons-react';
import { Search, RefreshCw, CreditCard } from 'lucide-react';
import Link from 'next/link';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import ListingModal from '../../../../components/skeleton/listingmodal';


export function PaymentTable({ columns }) {
  const dispatch = useDispatch();
  const { paymentConfigs, loading, error } = useSelector((state) => state.paymentConfig);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    // Fetch payment configurations from API
    dispatch(fetchPaymentConfigsThunk());
  }, [dispatch]);

  const table = useReactTable({
    data: paymentConfigs || [],
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


  // Always show table structure when not loading
  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payment configurations..."
              value={(table.getColumn("description")?.getFilterValue()) ?? ""}
              onChange={(event) =>
                table.getColumn("description")?.setFilterValue(event.target.value)
              }
              className="pl-8"
            />
          </div>
          <Select 
            value={(table.getColumn("type")?.getFilterValue()) ?? "all"}
            onValueChange={(value) => 
              table.getColumn("type")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="LOAN_FEE">Loan Fee</SelectItem>
              <SelectItem value="MEMBERSHIP">Membership</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          {error && (
            <Button variant="outline" size="sm" onClick={() => dispatch(fetchPaymentConfigsThunk({ forceRefresh: true }))}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
          <Button asChild size="sm">
            <Link href="/dashboard/payment-configurations/new">
              <IconPlus className="mr-2 h-4 w-4" />
              Add Configuration
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Custom Table with Payment icon for no results */}
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
                    <h3 className="text-lg font-semibold">No payment configurations found</h3>
                    <p className="text-muted-foreground">
                      {error
                        ? "Unable to load payment configurations. Please try again."
                        : "No payment configurations have been created yet."
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
      
      {/* Show error message in a subtle way */}
     
    </div>
  );
}