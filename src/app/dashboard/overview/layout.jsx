'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { IconTrendingDown, IconTrendingUp, IconRefresh } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { fetchAllDashboardDataThunk } from '@/redux/dashboard/dashboardThunks';
import { FunnelStepAnalysis } from '@/features/overview/components/funnel-step-analysis';
import React from 'react';

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}) {
  const dispatch = useDispatch();
  const { 
    overviewStats, 
    dashboardStats,
    overviewLoading, 
    statsLoading,
    overviewError,
    statsError,
    loading
  } = useSelector((state) => state.dashboard);

  // Fetch dashboard data on component mount
  useEffect(() => {
    dispatch(fetchAllDashboardDataThunk());
  }, [dispatch]);

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchAllDashboardDataThunk({ forceRefresh: true }));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  // Calculate percentage change
  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Get trend icon and color
  const getTrendInfo = (change) => {
    const isPositive = change >= 0;
    return {
      icon: isPositive ? IconTrendingUp : IconTrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      bgColor: isPositive ? 'bg-green-50' : 'bg-red-50',
      sign: isPositive ? '+' : ''
    };
  };

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-6">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, Welcome back 👋
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading.overview || loading.stats}
          >
            <IconRefresh className={`h-4 w-4 mr-2 ${
              loading.overview || loading.stats ? 'animate-spin' : ''
            }`} />
            Refresh
          </Button>
        </div>

        {/* Error Display */}
        {(overviewError || statsError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="text-sm">
              {overviewError || statsError}
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Active Members Card */}
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Active Members</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {overviewLoading ? (
                  <div className="h-8 bg-muted rounded animate-pulse" />
                ) : (
                  formatNumber(dashboardStats.activeMembers)
                )}
              </CardTitle>
              <CardAction>
                {!overviewLoading && (
                  <Badge variant="outline">
                    <IconTrendingUp className="h-3 w-3" />
                    Active
                  </Badge>
                )}
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Currently active users
              </div>
              <div className="text-muted-foreground">
                {formatNumber(dashboardStats.totalUsers - dashboardStats.activeMembers)} inactive
              </div>
            </CardFooter>
          </Card>

          {/* New Members Card */}
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Total Members</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {overviewLoading ? (
                  <div className="h-8 bg-muted rounded animate-pulse" />
                ) : (
                  formatNumber(dashboardStats.totalUsers)
                )}
              </CardTitle>
              <CardAction>
                {!overviewLoading && (
                  <Badge variant="outline">
                    <IconTrendingUp className="h-3 w-3" />
                    +{dashboardStats.monthlyGrowth || 0}%
                  </Badge>
                )}
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Active members <IconTrendingUp className="size-4" />
              </div>
              <div className="text-muted-foreground">
                Registered users
              </div>
            </CardFooter>
          </Card>

          {/* Total Loan Applications Card */}
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Loan Applications</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {overviewLoading ? (
                  <div className="h-8 bg-muted rounded animate-pulse" />
                ) : (
                  formatNumber(dashboardStats.totalLoans)
                )}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp className="h-3 w-3" />
                  Active
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total applications received
              </div>
              <div className="text-muted-foreground">
                {formatNumber(dashboardStats.pendingApplications)} pending review
              </div>
            </CardFooter>
          </Card>

          {/* Recent Activity Card */}
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Recent Activity</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {overviewLoading ? (
                  <div className="h-8 bg-muted rounded animate-pulse" />
                ) : (
                  formatNumber(dashboardStats.recentTransactions)
                )}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp className="h-3 w-3" />
                  This Week
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                New actions this week
              </div>
              <div className="text-muted-foreground">
                Applications and updates
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="w-full">{bar_stats}</div>
          <div className="w-full">{pie_stats}</div>
        </div>
        
        {/* Separate Funnel Step Analysis Section */}
        <div className="w-full">
          <FunnelStepAnalysis />
        </div>
      </div>
    </PageContainer>
  );
}
