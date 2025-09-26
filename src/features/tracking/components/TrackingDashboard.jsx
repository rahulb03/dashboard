'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';
import {
  fetchTrackingDashboardThunk,
  calculateStatsThunk
} from '@/redux/tracking/trackingThunks';
import { clearError, clearCalculateStatsResult } from '@/redux/tracking/trackingSlice';
import { toast } from 'sonner';

// Calculate Stats Result Modal/Card Component
const CalculateStatsResult = ({ result, onClose }) => {
  if (!result) return null;
  
  const stats = result.data;
  
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="h-5 w-5" />
            Stats Calculation Complete
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-white/80 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalSessions}
            </div>
            <div className="text-sm text-muted-foreground">Total Sessions</div>
          </div>
          <div className="text-center p-3 bg-white/80 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.completedSessions}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center p-3 bg-white/80 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.conversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Conversion Rate</div>
          </div>
          <div className="text-center p-3 bg-white/80 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.uniqueUsers}
            </div>
            <div className="text-sm text-muted-foreground">Unique Users</div>
          </div>
        </div>
        
        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium mb-2">Session Breakdown</h5>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="text-green-600">{stats.completedSessions}</span>
              </div>
              <div className="flex justify-between">
                <span>In Progress:</span>
                <span className="text-yellow-600">{stats.inProgressSessions}</span>
              </div>
              <div className="flex justify-between">
                <span>Abandoned:</span>
                <span className="text-red-600">{stats.abandonedSessions}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Duration:</span>
                <span>{Math.round(stats.averageSessionDuration)}s</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium mb-2">Top Drop-offs</h5>
            <div className="space-y-1">
              {stats.topDropOffs?.slice(0, 3).map((dropOff, index) => (
                <div key={index} className="flex justify-between">
                  <span className="truncate">{dropOff.step}</span>
                  <Badge variant="outline">{dropOff.count}</Badge>
                </div>
              )) || <div className="text-muted-foreground">No drop-offs</div>}
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>Calculated for: {stats.date}</span>
            <span>Calculated at: {new Date(result.meta.calculatedAt).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MetricCard = ({ title, value, change, icon: Icon, color = "default" }) => {
  const colorClasses = {
    default: "text-blue-600 bg-blue-100",
    success: "text-green-600 bg-green-100", 
    warning: "text-yellow-600 bg-yellow-100",
    danger: "text-red-600 bg-red-100"
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 rounded p-0.5 ${colorClasses[color]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const RecentActivityCard = ({ activities = [] }) => (
  <Card className="col-span-1 md:col-span-2">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Activity className="h-5 w-5" />
        Recent User Activity
      </CardTitle>
    </CardHeader>
    <CardContent>
      {activities.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          No recent activity
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {activity.phoneNumber}
                  </span>
                  <Badge variant={activity.isCompleted ? "default" : "secondary"}>
                    {activity.isCompleted ? "Completed" : "In Progress"}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.currentStep} • {activity.device}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(activity.lastActivity).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const TopDropOffsCard = ({ dropOffs = [] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        Top Drop-off Points
      </CardTitle>
    </CardHeader>
    <CardContent>
      {dropOffs.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          No drop-offs recorded
        </div>
      ) : (
        <div className="space-y-3">
          {dropOffs.map((dropOff, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm truncate">{dropOff.step}</span>
              <Badge variant="outline">{dropOff.count}</Badge>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export default function TrackingDashboard() {
  const dispatch = useDispatch();
  const {
    dashboard,
    dashboardLoading,
    dashboardError,
    loading,
    calculateStatsResult,
    calculateStatsLoading,
    calculateStatsError
  } = useSelector((state) => state.tracking);

  const [isCalculating, setIsCalculating] = useState(false);

  // Handle calculate stats result display
  const handleCloseStatsResult = () => {
    dispatch(clearCalculateStatsResult());
  };

  useEffect(() => {
    // Fetch dashboard data on mount
    dispatch(fetchTrackingDashboardThunk({ forceRefresh: false }));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchTrackingDashboardThunk({ forceRefresh: true }));
  };

  const handleCalculateStats = async () => {
    try {
      const result = await dispatch(calculateStatsThunk()).unwrap();
      toast.success('Stats calculated successfully');
      // Refresh dashboard after calculation
      dispatch(fetchTrackingDashboardThunk({ forceRefresh: true }));
    } catch (error) {
      toast.error(error.message || 'Failed to calculate stats');
    }
  };

  const clearErrorHandler = () => {
    dispatch(clearError());
  };

  if (dashboardError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading dashboard: {dashboardError}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearErrorHandler}
              className="ml-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const metrics = dashboard?.realTimeMetrics;
  const sessionStats = dashboard?.sessionStats;
  const recentActivity = dashboard?.recentActivity || [];
  const topDropOffs = dashboard?.topDropOffs || [];

  return (
    <div className="space-y-6">
      {/* Calculate Stats Result */}
      {calculateStatsResult && (
        <CalculateStatsResult 
          result={calculateStatsResult} 
          onClose={handleCloseStatsResult} 
        />
      )}

      {/* Calculate Stats Error */}
      {calculateStatsError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to calculate stats: {calculateStatsError}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => dispatch(clearCalculateStatsResult())}
              className="ml-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={dashboardLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${dashboardLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCalculateStats}
          disabled={calculateStatsLoading || loading}
        >
          <BarChart3 className={`h-4 w-4 mr-2 ${calculateStatsLoading ? 'animate-pulse' : ''}`} />
          {calculateStatsLoading ? 'Calculating...' : 'Calculate Stats'}
        </Button>
      </div>

      {/* Loading State */}
      {dashboardLoading && !dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Active Sessions"
            value={metrics.activeSessions?.toLocaleString() || '0'}
            icon={Users}
            color="success"
          />
          <MetricCard
            title="Today's Conversion"
            value={`${metrics.todayConversionRate || 0}%`}
            icon={Target}
            color="default"
          />
          <MetricCard
            title="Weekly Conversion"
            value={`${metrics.weeklyConversionRate || 0}%`}
            icon={TrendingUp}
            color="default"
          />
          <MetricCard
            title="Error Rate"
            value={`${metrics.errorRate || 0}%`}
            icon={metrics.errorRate > 5 ? XCircle : CheckCircle}
            color={metrics.errorRate > 5 ? "danger" : "success"}
          />
        </div>
      )}

      {/* Session Stats */}
      {sessionStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Sessions</span>
                  <span className="font-medium">{sessionStats.today?.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-medium text-green-600">{sessionStats.today?.completed || 0}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${sessionStats.today?.total > 0 ? (sessionStats.today.completed / sessionStats.today.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Sessions</span>
                  <span className="font-medium">{sessionStats.thisWeek?.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-medium text-green-600">{sessionStats.thisWeek?.completed || 0}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${sessionStats.thisWeek?.total > 0 ? (sessionStats.thisWeek.completed / sessionStats.thisWeek.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Sessions</span>
                  <span className="font-medium">{sessionStats.thisMonth?.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-medium text-green-600">{sessionStats.thisMonth?.completed || 0}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${sessionStats.thisMonth?.total > 0 ? (sessionStats.thisMonth.completed / sessionStats.thisMonth.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity and Drop-offs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivityCard activities={recentActivity} />
        <TopDropOffsCard dropOffs={topDropOffs} />
      </div>

      {/* Meta Information */}
      {dashboard?.meta && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Dashboard Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Generated:</span> {' '}
                {new Date(dashboard.meta.generatedAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">By:</span> {dashboard.meta.generatedBy}
              </div>
              <div>
                <span className="font-medium">Role:</span> {dashboard.meta.userRole}
              </div>
            </div>
            {dashboard.meta.dataRetentionNote && (
              <div className="mt-2 p-2 bg-muted rounded text-xs">
                <Clock className="h-3 w-3 inline mr-1" />
                {dashboard.meta.dataRetentionNote}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}