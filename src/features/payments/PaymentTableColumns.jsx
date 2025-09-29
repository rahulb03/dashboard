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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConfirmDeleteModal } from '@/components/modal/confirm-delete-modal';
import { 
  IconDotsVertical, 
  IconEye, 
  IconTrash,
  IconRefresh
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deletePaymentThunk, refundPaymentThunk } from '@/redux/payments/paymentThunks';
import { toast } from 'sonner';

const columnHelper = createColumnHelper();

// Status Badge Component
const StatusBadge = ({ status }) => {
  let variant = 'secondary';
  let displayText = status;

  switch (status?.toUpperCase()) {
    case 'SUCCESS':
      variant = 'default';
      displayText = 'Success';
      break;
    case 'FAILED':
      variant = 'destructive';
      displayText = 'Failed';
      break;
    case 'PENDING':
      variant = 'outline';
      displayText = 'Pending';
      break;
    case 'REFUNDED':
      variant = 'secondary';
      displayText = 'Refunded';
      break;
    case 'CREATED':
      variant = 'outline';
      displayText = 'Created';
      break;
    default:
      variant = 'secondary';
      break;
  }

  return <Badge variant={variant}>{displayText}</Badge>;
};

// Payment Type Badge Component
const PaymentTypeBadge = ({ type }) => {
  let variant = 'outline';
  let displayText = type;

  switch (type?.toUpperCase()) {
    case 'LOAN_FEE':
      variant = 'default';
      displayText = 'Loan Fee';
      break;
    case 'MEMBERSHIP':
      variant = 'secondary';
      displayText = 'Membership';
      break;
    case 'DOCUMENT_FEE':
      variant = 'outline';
      displayText = 'Document Fee';
      break;
    default:
      variant = 'secondary';
      displayText = type || 'Unknown';
      break;
  }

  return <Badge variant={variant}>{displayText}</Badge>;
};

// Cell Action Component
const CellAction = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const onConfirm = async () => {
    setLoading(true);
    try {
      await dispatch(deletePaymentThunk(data.id)).unwrap();
      toast.success('Payment deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete payment');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleRefund = async () => {
    setRefundLoading(true);
    try {
      await dispatch(refundPaymentThunk(data.id)).unwrap();
      toast.success('Payment refunded successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to refund payment');
    } finally {
      setRefundLoading(false);
    }
  };

  const canDelete = data.status === 'CREATED' || data.status === 'FAILED';
  const canRefund = data.status === 'SUCCESS' && !data.refundedAt;

  return (
    <>
      <ConfirmDeleteModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
        itemType="Payment"
        itemName={`Payment #${data.id}`}
        variant="contextual"
        description="This will permanently delete this payment record. This action cannot be undone."
      />
      <div className="flex items-center space-x-1">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <IconDotsVertical className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/payments/${data.id}/view`)}>
              <IconEye className='mr-2 h-4 w-4' /> View Details
            </DropdownMenuItem>
            {canRefund && (
              <DropdownMenuItem onClick={handleRefund} disabled={refundLoading}>
                <IconRefresh className='mr-2 h-4 w-4' />
                {refundLoading ? 'Refunding...' : 'Refund'}
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <IconTrash className='mr-2 h-4 w-4' /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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

  // User info (avatar + name + email)
  columnHelper.accessor('user.name', {
    id: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const payment = row.original;
      const user = payment.user;
      const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
      
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{user?.name || 'Unknown'}</span>
            <span className="text-xs text-muted-foreground">
              {user?.email || 'No email'}
            </span>
          </div>
        </div>
      );
    },
    enableSorting: true,
  }),

  // Mobile
  columnHelper.accessor('user.mobile', {
    id: 'mobile',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mobile" />
    ),
    cell: ({ row }) => {
      return <span className="text-sm">{row.original.user?.mobile || '-'}</span>;
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
        <div className="font-medium">
          ₹{amount ? parseFloat(amount).toLocaleString() : '0'}
        </div>
      );
    },
    enableSorting: true,
  }),

  // Payment Type
  columnHelper.accessor('type', {
    id: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type');
      return <PaymentTypeBadge type={type} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),

  // Payment Status
  columnHelper.accessor('status', {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status');
      return <StatusBadge status={status} />;
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
