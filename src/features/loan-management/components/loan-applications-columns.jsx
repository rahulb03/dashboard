'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { MoreHorizontal, Eye, Edit, Trash2, Download, FileText, CreditCard } from 'lucide-react';
import Link from 'next/link';

const getStatusBadge = (status) => {
  const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    PROCESSING: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
    APPROVED: { color: 'bg-green-100 text-green-800', label: 'Approved' },
    REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
  };
  const config = statusConfig[status] || {
    color: 'bg-gray-100 text-gray-800',
    label: status
  };
  return (
    <Badge className={`${config.color} border-0`}>
      {config.label}
    </Badge>
  );
};

const getPaymentStatusBadge = (status) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    failed: { color: 'bg-red-100 text-red-800', label: 'Failed' }
  };
  const config = statusConfig[status] || {
    color: 'bg-gray-100 text-gray-800',
    label: status
  };
  return (
    <Badge className={`${config.color} border-0`}>
      {config.label}
    </Badge>
  );
};

const formatCurrency = (amount) => {
  if (!amount) return 'Not specified';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const columns = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
    enableHiding: false
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Applicant" />
    ),
    size: 200,
    cell: ({ row }) => {
      const application = row.original;
      return (
        <div className="flex flex-col">
          <div className="font-medium">{application.fullName}</div>
          <div className="text-sm text-muted-foreground">
            {application.mobileNumber}
          </div>
          <div className="text-xs text-muted-foreground">
            Applied {formatDate(application.createdAt)}
          </div>
        </div>
      );
    },
    enableHiding: false,
    meta: {
      title: 'Applicant Details'
    }
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
    size: 250,
    cell: ({ row }) => {
      const application = row.original;
      return (
        <div className="flex flex-col">
          <div className="text-sm">{application.email}</div>
          <div className="text-sm text-muted-foreground">
            {application.address?.substring(0, 30)}...
          </div>
        </div>
      );
    },
    meta: {
      title: 'Contact Information'
    }
  },
  {
    accessorKey: 'panNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PAN" />
    ),
    cell: ({ row }) => {
      const application = row.original;
      return (
        <div className="flex flex-col">
          <div className="font-medium font-mono text-sm">
            {application.panNumber}
          </div>
        </div>
      );
    },
    meta: {
      title: 'PAN Number'
    }
  },
  {
    accessorKey: 'aadharNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aadhar" />
    ),
    cell: ({ row }) => {
      const application = row.original;
      return (
        <div className="flex flex-col">
          <div className="font-medium font-mono text-sm">
            {application.aadharNumber}
          </div>
        </div>
      );
    },
    meta: {
      title: 'Aadhar Number'
    }
  },
  {
    accessorKey: 'dateOfBirth',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date of Birth" />
    ),
    cell: ({ row }) => {
      const application = row.original;
      return (
        <div className="flex flex-col">
          <div className="text-sm">
            {formatDate(application.dateOfBirth)}
          </div>
        </div>
      );
    },
    meta: {
      title: 'Date of Birth'
    }
  },
  {
    accessorKey: 'employmentType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employment" />
    ),
    size: 180,
    cell: ({ row }) => {
      const application = row.original;
      return (
        <div className="flex flex-col">
          <div className="font-medium capitalize">
            {application.employmentType?.replace('_', ' ')}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(application.monthlySalary)}/month
          </div>
        </div>
      );
    },
    meta: {
      title: 'Employment & Salary'
    }
  },
  {
    accessorKey: 'desiredLoanAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Desired Amount" />
    ),
    size: 160,
    cell: ({ row }) => {
      const application = row.original;
      return (
        <div className="flex flex-col">
          <div className="font-medium">
            {formatCurrency(application.desiredLoanAmount)}
          </div>
          <div className="text-sm text-muted-foreground">
            Requested amount
          </div>
        </div>
      );
    },
    meta: {
      title: 'Desired Loan Amount'
    }
  },
  {
    accessorKey: 'loanAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loan Details" />
    ),
    cell: ({ row }) => {
      const application = row.original;
      return (
        <div className="flex flex-col">
          <div className="font-medium">
            {formatCurrency(application.loanAmount)}
          </div>
          <div className="text-sm text-muted-foreground">
            CIBIL: {application.cibilScore}
          </div>
        </div>
      );
    },
    meta: {
      title: 'Loan Amount & CIBIL'
    }
  },
  {
    accessorKey: 'applicationStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const application = row.original;
      return (
        <div className="flex flex-col space-y-1">
          {getStatusBadge(application.applicationStatus)}
          <div className="text-xs text-muted-foreground">
            Pay: {getPaymentStatusBadge(application.paymentStatus || 'pending')}
          </div>
        </div>
      );
    },
    enableHiding: false,
    meta: {
      title: 'Application & Payment Status'
    }
  },
  {
    accessorKey: 'documents',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Documents" />
    ),
    cell: ({ row }) => {
      const application = row.original;
      const docCount = application.documents?.length || 0;
      return (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{docCount}</span>
        </div>
      );
    },
    meta: {
      title: 'Document Count'
    }
  },
  {
    accessorKey: 'payments',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payments" />
    ),
    cell: ({ row }) => {
      const application = row.original;
      const paymentCount = application.payments?.length || 0;
      return (
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{paymentCount}</span>
        </div>
      );
    },
    meta: {
      title: 'Payment Count'
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const application = row.original;
      const { onDeleteApplication } = table.options.meta || {};

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link 
                href={`/dashboard/loans/applications/${application.id}/view`}
                className="flex items-center"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link 
                href={`/dashboard/loans/applications/${application.id}`}
                className="flex items-center"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link 
                href={`/dashboard/loans/documents?applicationId=${application.id}`}
                className="flex items-center"
              >
                <FileText className="mr-2 h-4 w-4" />
                Documents
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link 
                href={`/dashboard/loans/payments?applicationId=${application.id}`}
                className="flex items-center"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Payments
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600"
              onSelect={(e) => {
                e.preventDefault();
                onDeleteApplication?.(application);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];