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
  IconEdit, 
  IconTrash,
  IconClock,
  IconCalendarPlus
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteMembershipThunk, extendMembershipThunk } from '@/redux/membership/membershipThunks';
import { toast } from 'sonner';
import { formatDistanceToNow, format, isAfter, isBefore, addDays } from 'date-fns';

const columnHelper = createColumnHelper();

// Status Badge Component
const StatusBadge = ({ status, endDate }) => {
  const now = new Date();
  const end = new Date(endDate);
  const isExpiringSoon = isAfter(end, now) && isBefore(end, addDays(now, 7));

  let variant = 'secondary';
  let displayText = status;

  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      variant = isExpiringSoon ? 'destructive' : 'default';
      displayText = isExpiringSoon ? 'Expiring Soon' : 'Active';
      break;
    case 'EXPIRED':
      variant = 'destructive';
      displayText = 'Expired';
      break;
    case 'CANCELLED':
      variant = 'secondary';
      displayText = 'Cancelled';
      break;
    case 'SUSPENDED':
      variant = 'outline';
      displayText = 'Suspended';
      break;
    default:
      variant = 'secondary';
      break;
  }

  return <Badge variant={variant}>{displayText}</Badge>;
};

// Cell Action Component with Extend functionality
const CellAction = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [extendLoading, setExtendLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const onConfirm = async () => {
    setLoading(true);
    try {
      await dispatch(deleteMembershipThunk(data.id)).unwrap();
      toast.success('Membership cancelled successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to cancel membership');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleExtendMembership = async () => {
    setExtendLoading(true);
    try {
      await dispatch(extendMembershipThunk({
        userId: data.userId,
        extensionPeriod: 30,
        extensionType: 'days'
      })).unwrap();
      toast.success('Membership extended by 30 days successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to extend membership');
    } finally {
      setExtendLoading(false);
    }
  };

  const canExtend = data.status === 'ACTIVE' || data.status === 'EXPIRED';

  return (
    <>
      <ConfirmDeleteModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
        itemType="Membership"
        itemName={data.user?.name || `Membership #${data.id}`}
        variant="contextual"
        description="This will cancel the membership and the user will lose access to member benefits. This action cannot be undone."
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
            onClick={() => router.push(`/dashboard/memberships/${data.id}/view`)}
          >
            <IconEye className='mr-2 h-4 w-4' /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/memberships/${data.id}/edit`)}
          >
            <IconEdit className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          {canExtend && (
            <DropdownMenuItem
              onClick={handleExtendMembership}
              disabled={extendLoading}
            >
              <IconCalendarPlus className='mr-2 h-4 w-4' /> 
              {extendLoading ? 'Extending...' : 'Extend (+30 days)'}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setOpen(true)} className="text-destructive">
            <IconTrash className='mr-2 h-4 w-4' /> Cancel
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

  // Member info (avatar + name + email)
  columnHelper.accessor('user.name', {
    id: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Member" />
    ),
    cell: ({ row }) => {
      const membership = row.original;
      const user = membership.user;
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
    filterFn: (row, id, value) => {
      const membership = row.original;
      const user = membership.user;
      const searchTerm = value.toLowerCase();
      
      // Search in user name, email, and mobile
      const name = user?.name?.toLowerCase() || '';
      const email = user?.email?.toLowerCase() || '';
      const mobile = user?.mobile?.toLowerCase() || '';
      
      return name.includes(searchTerm) || 
             email.includes(searchTerm) || 
             mobile.includes(searchTerm);
    },
  }),

  // Mobile (from user data)
  columnHelper.accessor('user.mobile', {
    id: 'mobile',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mobile" />
    ),
    cell: ({ row }) => {
      return <span className="text-sm">{row.original.user?.mobile || '-'}</span>;
    },
  }),

  // Membership status
  columnHelper.accessor('status', {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const membership = row.original;
      return <StatusBadge status={membership.status} endDate={membership.endDate} />;
    },
    filterFn: (row, id, value) => {
      const status = row.getValue(id);
      if (Array.isArray(value)) {
        return value.includes(status);
      }
      return status === value;
    },
  }),

  // Start Date
  columnHelper.accessor('startDate', {
    id: 'startDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('startDate');
      if (!date) return <span className="text-muted-foreground text-sm">-</span>;
      
      const parsedDate = new Date(date);
      return (
        <div className="text-sm">
          {format(parsedDate, 'MMM dd, yyyy')}
        </div>
      );
    },
  }),

  // End Date with expiration indicator
  columnHelper.accessor('endDate', {
    id: 'endDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('endDate');
      if (!date) return <span className="text-muted-foreground text-sm">-</span>;
      
      const parsedDate = new Date(date);
      const now = new Date();
      const isExpired = isBefore(parsedDate, now);
      const isExpiringSoon = isAfter(parsedDate, now) && isBefore(parsedDate, addDays(now, 7));
      
      return (
        <div className="flex items-center space-x-2">
          <div className="text-sm">
            {format(parsedDate, 'MMM dd, yyyy')}
          </div>
          {isExpired && (
            <Badge variant="destructive" className="text-xs">
              Expired
            </Badge>
          )}
          {isExpiringSoon && !isExpired && (
            <IconClock className="h-4 w-4 text-destructive" title="Expiring soon" />
          )}
        </div>
      );
    },
  }),

  // Active status
  columnHelper.accessor('isActive', {
    id: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Active" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive');
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Yes' : 'No'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const isActive = row.getValue(id);
      if (Array.isArray(value)) {
        return value.includes(isActive);
      }
      return isActive === value;
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
          {format(parsedDate, 'MMM dd, yyyy')}
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