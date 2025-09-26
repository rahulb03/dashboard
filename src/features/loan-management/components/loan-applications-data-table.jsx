'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from '@tanstack/react-table';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { Plus, FileText, Download, RefreshCw } from 'lucide-react';
import { columns } from './loan-applications-columns';
import { 
  updateLoanStatusThunk,
  deleteLoanApplicationThunk
} from '@/redux/Loan_Application/loanThunks';
import { ConfirmDeleteModal } from '@/components/modal/confirm-delete-modal';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' }
];

const employmentTypeOptions = [
  { label: 'All Types', value: 'all' },
  { label: 'Salaried', value: 'salaried' },
  { label: 'Self Employed', value: 'self_employed' },
  { label: 'Business', value: 'business' },
  { label: 'Freelancer', value: 'freelancer' }
];

export default function LoanApplicationsDataTable({ 
  applications = [], 
  loading = false,
  onRefresh,
  onExport,
  showActions = true
}) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employmentFilter, setEmploymentFilter] = useState('all');
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({
    // Hide some columns by default to reduce clutter
    documents: false,
    payments: false,
    email: false,
    panNumber: false,
    aadharNumber: false,
    dateOfBirth: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Filter applications based on filters
  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesSearch = globalFilter === '' || 
        application.fullName?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        application.email?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        application.mobileNumber?.includes(globalFilter);
      
      const matchesStatus = statusFilter === 'all' || 
        application.applicationStatus === statusFilter;
      
      const matchesEmployment = employmentFilter === 'all' || 
        application.employmentType === employmentFilter;
      
      return matchesSearch && matchesStatus && matchesEmployment;
    });
  }, [applications, globalFilter, statusFilter, employmentFilter]);


  // Handle delete application
  const handleDeleteApplication = async () => {
    if (!selectedApplication) return;
    
    try {
      await dispatch(deleteLoanApplicationThunk(selectedApplication.id)).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedApplication(null);
      toast({
        title: 'Success',
        description: 'Application deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete application',
        variant: 'destructive',
      });
    }
  };

  // Handle status update
  const handleStatusUpdate = async (applicationId, newStatus) => {
    setUpdatingStatus(prev => new Set([...prev, applicationId]));
    try {
      await dispatch(updateLoanStatusThunk({ id: applicationId, status: newStatus })).unwrap();
      toast({
        title: 'Success',
        description: 'Application status updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  // Enhanced columns with status update functionality
  const enhancedColumns = useMemo(() => {
    return columns.map(column => {
      if (column.accessorKey === 'applicationStatus') {
        return {
          ...column,
          cell: ({ row }) => {
            const application = row.original;
            const isUpdating = updatingStatus.has(application.id);
            
            return (
              <Select
                value={application.applicationStatus}
                onValueChange={(value) => handleStatusUpdate(application.id, value)}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.filter(opt => opt.value !== 'all').map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          }
        };
      }
      return column;
    });
  }, [columns, updatingStatus, handleStatusUpdate]);

  // Create table instance
  const table = useReactTable({
    data: filteredApplications,
    columns: enhancedColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: {
      onDeleteApplication: (application) => {
        setSelectedApplication(application);
        setIsDeleteDialogOpen(true);
      }
    }
  });

  const handleExportData = () => {
    if (onExport) {
      onExport(filteredApplications);
    }
  };

  // Bulk status update
  const handleBulkStatusUpdate = async (status) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    const selectedIds = selectedRows.map(row => row.original.id);
    
    try {
      await Promise.all(
        selectedIds.map(id => dispatch(updateLoanStatusThunk({ id, status })).unwrap())
      );
      
      toast({
        title: 'Success',
        description: `Updated ${selectedIds.length} applications to ${status}`,
      });
      
      // Clear selection
      setRowSelection({});
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update some applications',
        variant: 'destructive',
      });
    }
  };

  const ActionBar = () => {
    const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
    
    if (selectedRowsCount === 0) return null;
    
    return (
      <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
        <span className="text-sm font-medium">
          {selectedRowsCount} application(s) selected
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <Select onValueChange={handleBulkStatusUpdate}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Set to Pending</SelectItem>
              <SelectItem value="PROCESSING">Set to Processing</SelectItem>
              <SelectItem value="APPROVED">Set to Approved</SelectItem>
              <SelectItem value="REJECTED">Set to Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setRowSelection({})}
          >
            Clear Selection
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 ">
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
      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search applications..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={employmentFilter} onValueChange={setEmploymentFilter}>
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="Employment" />
            </SelectTrigger>
            <SelectContent>
              {employmentTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(globalFilter || statusFilter !== 'all' || employmentFilter !== 'all') && (
            <Button
              variant="ghost"
              onClick={() => {
                setGlobalFilter('');
                setStatusFilter('all');
                setEmploymentFilter('all');
              }}
              className="h-8 px-2 lg:px-3"
            >
              Reset
            </Button>
          )}
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            <DataTableViewOptions table={table} />
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
              onClick={handleExportData}
              disabled={filteredApplications.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button asChild size="sm">
              <Link href="/dashboard/loans/applications/new">
                <Plus className="h-4 w-4 mr-2" />
                New Application
              </Link>
            </Button>
          </div>
        )}
      </div>
      
      <DataTable 
        table={table} 
        actionBar={<ActionBar />}
      />
      
      {filteredApplications.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No applications found
          </h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            {applications.length === 0 
              ? "Get started by creating your first loan application."
              : "No applications match your current filters. Try adjusting your search criteria."
            }
          </p>
          {applications.length === 0 && showActions && (
            <Button asChild>
              <Link href="/dashboard/loans/applications/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Application
              </Link>
            </Button>
          )}
        </div>
      )}
      
      {/* DELETE Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteApplication}
        loading={loading}
        itemType="Loan Application"
        itemName={selectedApplication?.fullName}
        variant="contextual"
        description="This will permanently delete this loan application and all associated documents and payment records. This action cannot be undone."
      />
    </div>
  );
}
