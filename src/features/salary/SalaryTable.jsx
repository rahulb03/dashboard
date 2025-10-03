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
import { useDispatch, useSelector } from 'react-redux';
import { fetchSalariesThunk, searchSalariesThunk } from '@/redux/salary/salaryThunks';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, RefreshCw, Banknote, DollarSign, Briefcase, UserCheck, CheckSquare } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  selectSalaries,
  selectSalaryFetching,
  selectSalaryError,
  selectSearchQuery,
  selectCurrentEmploymentType,
  setSearchQuery,
  setCurrentEmploymentType
} from '@/redux/salary/salarySlice';

export function SalaryTable({ columns }) {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const salaries = useSelector(selectSalaries);
  const isLoading = useSelector(selectSalaryFetching);
  const error = useSelector(selectSalaryError);
  const searchQuery = useSelector(selectSearchQuery);
  const currentEmploymentType = useSelector(selectCurrentEmploymentType);
  
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  // Load initial data
  useEffect(() => {
    dispatch(fetchSalariesThunk());
  }, [dispatch]);

  // Filter salaries based on search and employment type
  const filteredSalaries = useMemo(() => {
    if (!salaries) return [];
    
    let filtered = [...salaries];
    
    // Filter by employment type
    if (currentEmploymentType && currentEmploymentType !== 'all') {
      filtered = filtered.filter(salary => 
        salary.employmentType === currentEmploymentType
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(salary => 
        salary.employmentType.toLowerCase().includes(query) ||
        salary.minSalary.toString().includes(query) ||
        salary.maxSalary?.toString().includes(query) ||
        salary.loanAmount.toString().includes(query) ||
        salary.minCibilScore.toString().includes(query) ||
        salary.maxCibilScore?.toString().includes(query) ||
        salary.interestRate.toString().includes(query) ||
        salary.emiOptions?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [salaries, searchQuery, currentEmploymentType]);

  const table = useReactTable({
    data: filteredSalaries || [],
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

  const handleSearchChange = (value) => {
    dispatch(setSearchQuery(value));
  };

  const handleEmploymentTypeChange = (value) => {
    dispatch(setCurrentEmploymentType(value));
  };

  if (isLoading) {
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

  // Remove error blocking - show table structure with error notice

  return (
    <div className="space-y-4">
      {/* Header with filters and add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search configurations..."
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="pl-8"
            />
          </div>
          
          {/* Employment Type Filter */}
          <Select 
            value={currentEmploymentType}
            onValueChange={handleEmploymentTypeChange}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="salaried">Salaried</SelectItem>
              <SelectItem value="self-employed">Self-Employed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Add Configuration Button */}
        <div className="flex items-center space-x-2">
          {error && (
            <Button variant="outline" size="sm" onClick={() => dispatch(fetchSalariesThunk({ forceRefresh: true }))}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
          <Button onClick={() => router.push('/dashboard/salary/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Configuration
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {filteredSalaries && filteredSalaries.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Configurations Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Configurations</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredSalaries.length}</div>
              <p className="text-xs text-muted-foreground">
                All salary configs
              </p>
            </CardContent>
          </Card>

          {/* Salaried Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salaried</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredSalaries.filter(s => s.employmentType === 'salaried').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Salaried employees
              </p>
            </CardContent>
          </Card>

          {/* Self-Employed Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Self-Employed</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredSalaries.filter(s => s.employmentType === 'self-employed').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Self-employed configs
              </p>
            </CardContent>
          </Card>

          {/* Selected Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selected</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {table.getFilteredSelectedRowModel().rows.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Rows selected
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Custom Table with Salary icon for no results */}
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
                    <Banknote className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">No salary configurations found</h3>
                    <p className="text-muted-foreground">
                      {error
                        ? "Unable to load salary configurations. Please try again."
                        : "No salary configurations have been created yet."
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
    
      {/* Bulk Actions */}
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              // Handle bulk delete
              const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.id);
              console.log('Bulk delete:', selectedIds);
              // You can dispatch bulk delete action here
            }}
          >
            Delete Selected
          </Button>
        </div>
      )}
    </div>
  );
}