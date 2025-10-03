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
import { fetchTrackingSessionsThunk, exportSessionsThunk } from '@/redux/tracking/trackingThunks';
import { updateSessionsFilters, clearError } from '@/redux/tracking/trackingSlice';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Download, Users, Filter, CheckCircle, XCircle, Activity } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TrackingSessionsTable({ columns }) {
  const dispatch = useDispatch();
  const {
    sessions,
    sessionsPagination,
    sessionsFilters,
    sessionsLoading,
    sessionsError
  } = useSelector((state) => state.tracking);
  
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Memoize the filters to prevent infinite loops
  const memoizedFilters = useMemo(() => sessionsFilters, [
    sessionsFilters.status,
    sessionsFilters.dateRange,
    sessionsFilters.phoneNumber,
    sessionsFilters.includeSteps
  ]);

  useEffect(() => {
    if (isInitialLoad) {
      // Only fetch on initial load
      dispatch(fetchTrackingSessionsThunk({ ...memoizedFilters, forceRefresh: false }));
      setIsInitialLoad(false);
    }
  }, [dispatch, memoizedFilters, isInitialLoad]);

  const table = useReactTable({
    data: sessions || [],
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

  const handleRefresh = useCallback(() => {
    dispatch(fetchTrackingSessionsThunk({ 
      ...memoizedFilters, 
      offset: 0, 
      forceRefresh: true 
    }));
  }, [dispatch, memoizedFilters]);

  const handleFilterChange = useCallback((key, value) => {
    dispatch(updateSessionsFilters({ [key]: value }));
    dispatch(fetchTrackingSessionsThunk({ 
      ...memoizedFilters, 
      [key]: value, 
      offset: 0,
      forceRefresh: true
    }));
  }, [dispatch, memoizedFilters]);

  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      dispatch(updateSessionsFilters({ phoneNumber: searchTerm.trim() }));
      dispatch(fetchTrackingSessionsThunk({ 
        ...memoizedFilters, 
        phoneNumber: searchTerm.trim(), 
        offset: 0,
        forceRefresh: true
      }));
    } else {
      dispatch(updateSessionsFilters({ phoneNumber: null }));
      dispatch(fetchTrackingSessionsThunk({ 
        ...memoizedFilters, 
        phoneNumber: null, 
        offset: 0,
        forceRefresh: true
      }));
    }
  }, [dispatch, memoizedFilters, searchTerm]);

  const handleExport = useCallback(async () => {
    try {
      await dispatch(exportSessionsThunk({ filters: memoizedFilters })).unwrap();
      toast.success('Sessions exported successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to export sessions');
    }
  }, [dispatch, memoizedFilters]);

  const clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show empty state instead of network error for better UX
  if (!sessions && !sessionsLoading && sessionsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Sessions Available</h3>
              <p className="text-muted-foreground mb-4">
                There are currently no tracking sessions to display. Sessions will appear here once user activity is recorded.
              </p>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionsLoading && (!sessions || sessions.length === 0)) {
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
      {/* Stats Overview */}
      {sessions && sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionsPagination?.total || 0}</div>
              <p className="text-xs text-muted-foreground">All tracking sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessions?.filter(s => s?.isCompleted).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Completed sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessions?.filter(s => !s?.isCompleted && !s?.dropOffStep).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Active sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abandoned</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessions?.filter(s => !s?.isCompleted && s?.dropOffStep).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Abandoned sessions</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header with filters and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-8"
            />
          </div>
          
          {/* Search Button */}
          <Button variant="outline" size="sm" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
          
          {/* Status Filter */}
          <Select 
            value={sessionsFilters.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value === 'all' ? 'all' : value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Date Range Filter */}
          <Select 
            value={sessionsFilters.dateRange || '7d'}
            onValueChange={(value) => handleFilterChange('dateRange', value)}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={sessionsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${sessionsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {/* Export Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            disabled={sessionsLoading || !sessions || sessions.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
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
                    <h3 className="text-lg font-semibold">No sessions found</h3>
                    <p className="text-muted-foreground">
                      {!sessions || sessions.length === 0
                        ? "No tracking sessions available."
                        : "No sessions match your current search criteria."
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
      {sessions && sessions.length > 0 && (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}