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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  IconDotsVertical, 
  IconEye, 
  IconDownload,
  IconClock,
  IconCheck,
  IconX,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const columnHelper = createColumnHelper();

// Cell Action Component
const CellAction = ({ data }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    // Show detailed session information
    const phoneNumber = data?.phoneNumber || data?.adminInfo?.fullPhoneNumber || 'N/A';
    const fullName = data?.fullName || 'Not provided';
    const sessionInfo = [
      `Session ID: ${data.sessionId}`,
      `Name: ${fullName}`,
      `Phone: ${phoneNumber}`,
      data?.adminInfo?.ipAddress ? `IP: ${data.adminInfo.ipAddress}` : null,
      data?.currentStep ? `Current Step: ${data.currentStep}` : null,
      data?.completionRate ? `Progress: ${Math.round(data.completionRate)}%` : null,
      data?.isCompleted ? 'Status: Completed' : 'Status: In Progress'
    ].filter(Boolean).join('\n');
    
    toast.info('Session Details', {
      description: sessionInfo
    });
  };

  const handleExportSession = () => {
    // Export individual session data
    const sessionData = {
      sessionId: data.sessionId,
      fullName: data?.fullName || 'Not provided',
      phoneNumber: data?.adminInfo?.fullPhoneNumber || data?.phoneNumber || 'N/A',
      startedAt: data.startedAt || 'N/A',
      currentStep: data.currentStep || 'N/A',
      isCompleted: data.isCompleted ? 'Yes' : 'No',
      completionRate: data?.completionRate ? Math.round(data.completionRate) : 'N/A',
      device: data?.adminInfo?.deviceInfo?.device || data?.device || 'Unknown',
      ipAddress: data?.adminInfo?.ipAddress || data?.ipAddress || 'N/A'
    };
    
    const csvContent = Object.entries(sessionData).map(([key, value]) => `${key},${value}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session_${data.sessionId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Session data exported');
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Open menu</span>
          <IconDotsVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleViewDetails}>
          <IconEye className='mr-2 h-4 w-4' /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportSession}>
          <IconDownload className='mr-2 h-4 w-4' /> Export Session
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Device Icon Component
const DeviceIcon = ({ device }) => {
  if (!device) return <IconDeviceDesktop className="h-4 w-4" />;
  
  const deviceLower = device.toLowerCase();
  if (deviceLower.includes('mobile') || deviceLower.includes('phone')) {
    return <IconDeviceMobile className="h-4 w-4" />;
  } else if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) {
    return <IconDeviceTablet className="h-4 w-4" />;
  }
  return <IconDeviceDesktop className="h-4 w-4" />;
};

export const trackingSessionsColumns = [
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

  // User Info (avatar with phone number and additional data)
  columnHelper.accessor('phoneNumber', {
    id: 'userInfo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Details" />
    ),
    cell: ({ row }) => {
      const session = row.original;
      const phoneNumber = session?.phoneNumber || session?.adminInfo?.fullPhoneNumber || 'N/A';
      const fullName = session?.fullName || 'N/A';
      const nameInitials = fullName !== 'N/A' ? fullName.substring(0, 2).toUpperCase() : (phoneNumber !== 'N/A' ? phoneNumber.slice(-2) : 'NA');
      
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {fullName !== 'N/A' ? fullName : 'No Name Provided'}
            </span>
            <span className="text-sm text-muted-foreground">
              {phoneNumber === 'N/A' ? 'No Phone Number' : phoneNumber}
            </span>
            {session?.adminInfo?.ipAddress && (
              <span className="text-xs text-muted-foreground">
                IP: {session.adminInfo.ipAddress}
              </span>
            )}
            {session?.adminInfo?.userAgent && (
              <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={session.adminInfo.userAgent}>
                Browser: {session.adminInfo.userAgent.split(' ')[0]}
              </span>
            )}
          </div>
        </div>
      );
    },
    enableSorting: true,
    filterFn: 'includesString',
  }),

  // Status
  columnHelper.accessor('isCompleted', {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const session = row.original;
      const isCompleted = session?.isCompleted;
      const hasDropOff = session?.dropOffStep;
      
      let status = 'In Progress';
      let variant = 'secondary';
      let icon = <IconClock className="h-3 w-3" />;
      
      if (isCompleted) {
        status = 'Completed';
        variant = 'default';
        icon = <IconCheck className="h-3 w-3" />;
      } else if (hasDropOff) {
        status = 'Abandoned';
        variant = 'destructive';
        icon = <IconX className="h-3 w-3" />;
      }
      
      return (
        <Badge variant={variant} className="gap-1">
          {icon}
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const session = row.original;
      if (value === 'completed') return session?.isCompleted === true;
      if (value === 'abandoned') return session?.isCompleted === false && session?.dropOffStep;
      if (value === 'active') return session?.isCompleted === false && !session?.dropOffStep;
      return true;
    },
  }),

  // Current Step
  columnHelper.accessor('currentStep', {
    id: 'currentStep',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Current Step" />
    ),
    cell: ({ row }) => {
      const currentStep = row.getValue('currentStep');
      return (
        <span className="text-sm font-medium">
          {currentStep || 'N/A'}
        </span>
      );
    },
  }),

  // Device & Browser
  columnHelper.accessor('adminInfo.deviceInfo', {
    id: 'device',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Device" />
    ),
    cell: ({ row }) => {
      const session = row.original;
      const deviceInfo = session?.adminInfo?.deviceInfo;
      const device = deviceInfo?.device || 'Unknown';
      const browser = deviceInfo?.browser || 'Unknown Browser';
      const os = deviceInfo?.os || '';
      
      return (
        <div className="flex items-center space-x-2">
          <DeviceIcon device={device} />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{device}</span>
            <span className="text-xs text-muted-foreground">{browser}</span>
            {os && (
              <span className="text-xs text-muted-foreground">{os}</span>
            )}
          </div>
        </div>
      );
    },
  }),

  // Started At
  columnHelper.accessor('startedAt', {
    id: 'startedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Started" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('startedAt');
      if (!date) return <span className="text-muted-foreground">Unknown</span>;
      
      const parsedDate = new Date(date);
      const isToday = parsedDate.toDateString() === new Date().toDateString();
      
      return (
        <div className="flex flex-col">
          <span className="text-sm">
            {isToday ? 'Today' : parsedDate.toLocaleDateString()}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(parsedDate, { addSuffix: true })}
          </span>
        </div>
      );
    },
    enableSorting: true,
  }),

  // Additional Info
  columnHelper.display({
    id: 'metadata',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Info" />
    ),
    cell: ({ row }) => {
      const session = row.original;
      const completionRate = session?.completionRate;
      const flowVersion = session?.flowVersion;
      const dropOffStep = session?.dropOffStep;
      
      return (
        <div className="flex flex-col space-y-1">
          {completionRate !== null && completionRate !== undefined && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${Math.round(completionRate)}%` }}
                />
              </div>
              <span className="text-xs font-medium">{Math.round(completionRate)}%</span>
            </div>
          )}
          {flowVersion && (
            <span className="text-xs text-muted-foreground">v{flowVersion}</span>
          )}
          {dropOffStep && (
            <span className="text-xs text-destructive">Drop: {dropOffStep}</span>
          )}
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