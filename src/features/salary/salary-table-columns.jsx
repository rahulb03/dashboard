'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { AlertModal } from '@/components/modal/alert-modal';
import { 
  IconDotsVertical, 
  IconEye, 
  IconEdit, 
  IconTrash 
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteSalaryThunk, fetchSalariesThunk } from '@/redux/salary/salaryThunks';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const columnHelper = createColumnHelper();

// Format currency helper
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Format CIBIL range helper
const formatCibilRange = (minScore, maxScore) => {
  return maxScore ? `${minScore}-${maxScore}` : `${minScore}`;
};

// Cell Action Component
const CellAction = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const onConfirm = async () => {
    setLoading(true);
    try {
      await dispatch(deleteSalaryThunk(data.id)).unwrap();
      toast.success('Salary configuration deleted successfully');
      // Refresh the salary list immediately after delete
      dispatch(fetchSalariesThunk({ forceRefresh: true }));
    } catch (error) {
      toast.error(error.message || 'Failed to delete salary configuration');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
        title="Delete Salary Configuration"
        description="Are you sure you want to delete this salary configuration? This action cannot be undone."
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/salary/${data.id}/view`)}
          >
            <IconEye className='mr-2 h-4 w-4' /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/salary/${data.id}/edit`)}
          >
            <IconEdit className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <IconTrash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const salaryColumns = [
  // Row selection checkbox
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
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
    enableHiding: false,
  }),

  // Employment Type
  columnHelper.accessor('employmentType', {
    id: 'employmentType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employment Type" />
    ),
    cell: ({ row }) => {
      const employmentType = row.getValue('employmentType');
      const variant = employmentType === 'salaried' ? 'default' : 'secondary';
      
      return (
        <Badge variant={variant} className="capitalize">
          {employmentType || 'Unknown'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),

  // Salary Range
  columnHelper.accessor('minSalary', {
    id: 'salaryRange',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Salary Range" />
    ),
    cell: ({ row }) => {
      const salary = row.original;
      const minSalary = formatCurrency(salary.minSalary || 0);
      const maxSalary = salary.maxSalary ? formatCurrency(salary.maxSalary) : 'No Limit';
      
      return (
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium">{minSalary}</span>
          <span className="text-xs text-muted-foreground">to {maxSalary}</span>
        </div>
      );
    },
    enableSorting: true,
  }),

  // CIBIL Score Range
  columnHelper.accessor('minCibilScore', {
    id: 'cibilRange',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CIBIL Score" />
    ),
    cell: ({ row }) => {
      const salary = row.original;
      const cibilRange = formatCibilRange(salary.minCibilScore, salary.maxCibilScore);
      
      return (
        <Badge variant="outline" className="font-mono">
          {cibilRange}
        </Badge>
      );
    },
    enableSorting: true,
  }),

  // Loan Amount
  columnHelper.accessor('loanAmount', {
    id: 'loanAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loan Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('loanAmount');
      return (
        <span className="text-sm font-medium">
          {formatCurrency(amount || 0)}
        </span>
      );
    },
    enableSorting: true,
  }),

  // Interest Rate
  columnHelper.accessor('interestRate', {
    id: 'interestRate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Interest Rate" />
    ),
    cell: ({ row }) => {
      const rate = row.getValue('interestRate');
      return (
        <span className="text-sm font-medium">
          {rate ? `${rate}%` : '0%'}
        </span>
      );
    },
    enableSorting: true,
  }),

  // EMI Options
  columnHelper.accessor('emiOptions', {
    id: 'emiOptions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="EMI Options" />
    ),
    cell: ({ row }) => {
      const options = row.getValue('emiOptions');
      return (
        <span className="text-sm text-muted-foreground">
          {options || 'Not specified'}
        </span>
      );
    },
  }),

  // Created date
  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt');
      if (!date) return <span className="text-muted-foreground text-sm">Unknown</span>;
      
      const parsedDate = new Date(date);
      return (
        <div className="flex flex-col space-y-1">
          <span className="text-sm">{parsedDate.toLocaleDateString()}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(parsedDate, { addSuffix: true })}
          </span>
        </div>
      );
    },
    enableSorting: true,
  }),

  // Updated date
  columnHelper.accessor('updatedAt', {
    id: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('updatedAt');
      if (!date) return <span className="text-muted-foreground text-sm">Never</span>;
      
      const parsedDate = new Date(date);
      return (
        <div className="flex flex-col space-y-1">
          <span className="text-sm">{parsedDate.toLocaleDateString()}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(parsedDate, { addSuffix: true })}
          </span>
        </div>
      );
    },
    enableSorting: true,
  }),

  // Actions
  columnHelper.display({
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <CellAction data={row.original} />,
  }),
];