'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { fetchRecentActivitiesThunk } from '@/redux/dashboard/dashboardThunks';

export function RecentSales() {
  const dispatch = useDispatch();
  const { recentActivities, activitiesLoading, activitiesError } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchRecentActivitiesThunk({ limit: 5 }));
  }, [dispatch]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Generate user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate avatar URL
  const getAvatarUrl = (userId) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
  };

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>
          {activitiesLoading 
            ? 'Loading recent activities...' 
            : `${recentActivities?.length || 0} recent transactions`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activitiesError ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">Failed to load recent activities</p>
          </div>
        ) : activitiesLoading ? (
          <div className='space-y-6'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='flex items-center space-x-4'>
                <div className='w-9 h-9 bg-muted rounded-full animate-pulse' />
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-muted rounded animate-pulse' />
                  <div className='h-3 bg-muted rounded animate-pulse w-2/3' />
                </div>
                <div className='w-20 h-4 bg-muted rounded animate-pulse' />
              </div>
            ))}
          </div>
        ) : recentActivities?.length > 0 ? (
          <div className='space-y-6'>
            {recentActivities.map((activity, index) => (
              <div key={activity.id || index} className='flex items-center'>
                <Avatar className='h-9 w-9'>
                  <AvatarImage 
                    src={getAvatarUrl(activity.userId || activity.memberName)} 
                    alt={activity.memberName || 'User'} 
                  />
                  <AvatarFallback>
                    {getInitials(activity.memberName || activity.userName || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm leading-none font-medium'>
                    {activity.memberName || activity.userName || 'Unknown User'}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {activity.type || 'Loan Application'} • {activity.status || 'Processing'}
                  </p>
                </div>
                <div className='ml-auto'>
                  <div className='text-sm font-medium text-right'>
                    {activity.amount ? formatCurrency(activity.amount) : '—'}
                  </div>
                  <div className='text-xs text-muted-foreground text-right'>
                    {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Today'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <p className="text-sm mb-2">No recent activities</p>
              <p className="text-xs">Activities will appear here when users take actions</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
