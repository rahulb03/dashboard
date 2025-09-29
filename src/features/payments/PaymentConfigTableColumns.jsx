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
import { ConfirmDeleteModal } from '@/components/modal/confirm-delete-modal';
import { 
  IconDotsVertical, 
  IconEye, 
  IconEdit, 
  IconTrash,
  IconToggleLeft,
  IconToggleRight
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deletePaymentConfigThunk, togglePaymentConfigThunk } from '@/redux/payments/paymentConfigThunks';
import { toast } from 'sonner';

const columnHelper = createColumnHelper();

// Cell Action Component
const CellAction = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const onConfirm = async () => {
    setLoading(true);
    try {
      await dispatch(deletePaymentConfigThunk(data.id)).unwrap();
      toast.success('Payment configuration deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete payment configuration');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onToggleStatus = async () => {
    try {
      await dispatch(togglePaymentConfigThunk(data.id)).unwrap();
      toast.success(`Payment configuration ${data.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error(error.message || 'Failed to toggle payment configuration status');
    }
  };

  return (
    <>
      <ConfirmDeleteModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
        itemType="Payment Configuration"
        itemName={data.name || data.method || `#${data.id}`}
        variant="contextual"
        description="This will permanently remove this payment configuration. This action cannot be undone."
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
            onClick={() => router.push(`/dashboard/payment-configurations/${data.id}/view`)}
          >
            <IconEye className='mr-2 h-4 w-4' /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/payment-configurations/${data.id}/edit`)}
          >
            <IconEdit className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleStatus}>
            {data.isActive ? (
              <IconToggleLeft className='mr-2 h-4 w-4' />
            ) : (
              <IconToggleRight className='mr-2 h-4 w-4' />
            )}
            {data.isActive ? 'Deactivate' : 'Activate'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <IconTrash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const columns = [
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

  // Type
  columnHelper.accessor('type', {
    id: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type');
      const typeLabels = {
        'LOAN_FEE': 'Loan Fee',
        'MEMBERSHIP': 'Membership',
        'PROCESSING': 'Processing'
      };
      const typeLabel = typeLabels[type] || type;
      
      return (
        <Badge variant="outline" className="capitalize">
          {typeLabel}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),

  // Amount
  columnHelper.accessor('amount', {
    id: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amount');
      return (
        <div className="font-semibold">
          {amount ? `$${parseFloat(amount).toFixed(2)}` : 'Amount not set'}
        </div>
      );
    },
  }),

  // Description
  columnHelper.accessor('description', {
    id: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      const description = row.getValue('description');
      return (
        <div className="max-w-[300px] truncate" title={description}>
          {description || 'No description available'}
        </div>
      );
    },
    enableSorting: true,
  }),

  // Status
  columnHelper.accessor('isActive', {
    id: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive');
      
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
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
        <div className="text-sm">
          {parsedDate.toLocaleDateString()}
        </div>
      );
    },
  }),

  // Actions
  columnHelper.display({
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <CellAction data={row.original} />,
  }),
];