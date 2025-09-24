'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Text } from 'lucide-react';
import { CellAction } from './cell-action';
import { TYPE_OPTIONS, STATUS_OPTIONS } from './options';

export const columns = [
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ cell }) => {
      const type = cell.getValue();
      const typeLabel = TYPE_OPTIONS.find(option => option.value === type)?.label || type;
      
      return (
        <Badge variant='outline' className='capitalize'>
          {typeLabel}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Payment Type',
      variant: 'multiSelect',
      options: TYPE_OPTIONS
    }
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ cell }) => {
      const amount = cell.getValue();
      return (
        <div className="font-semibold">
          {amount ? `$${parseFloat(amount).toFixed(2)}` : 'Amount not set'}
        </div>
      );
    }
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ cell }) => {
      const description = cell.getValue();
      return (
        <div className="max-w-[300px] truncate" title={description}>
          {description || 'No description available'}
        </div>
      );
    },
    meta: {
      label: 'Description',
      placeholder: 'Search descriptions...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const isActive = cell.getValue();
      
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: STATUS_OPTIONS
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ cell }) => {
      const date = cell.getValue();
      return date ? new Date(date).toLocaleDateString() : 'N/A';
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];