'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  TrendingUp,
  Target,
  Activity,
  Clock,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { fetchTrackingDashboardThunk } from '@/redux/tracking/trackingThunks';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function TrackingOverviewCards() {
  const dispatch = useDispatch();
  const {
    dashboard: trackingDashboard,
    dashboardLoading: trackingLoading,
    dashboardError: trackingError
  } = useSelector((state) => state.tracking);

  useEffect(() => {
    dispatch(fetchTrackingDashboardThunk({ forceRefresh: false }));
  }, [dispatch]);

  if (trackingError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Failed to load tracking data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trackingLoading && !trackingDashboard) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
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
    );
  }

  if (!trackingDashboard) return null;

  const {
    realTimeMetrics = {},
    sessionStats = {},
    topDropOffs = [],
    recentActivity = []
  } = trackingDashboard;

  // Prepare pie chart data for session completion
  const sessionCompletionData = [
    {
      name: 'Completed',
      value: sessionStats.thisWeek?.completed || 0,
      color: '#00C49F'
    },
    {
      name: 'Incomplete',
      value: (sessionStats.thisWeek?.total || 0) - (sessionStats.thisWeek?.completed || 0),
      color: '#FF8042'
    }
  ].filter(item => item.value > 0);

  // Prepare drop-off data for visualization
  const dropOffData = (topDropOffs || []).slice(0, 5).map((item, index) => ({
    name: item.step.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: item.count,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Real-time Metrics Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Live Activity
          </CardTitle>
          <Activity className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{realTimeMetrics.activeSessions || 0}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>Active Sessions</span>
            {realTimeMetrics.errorRate !== undefined && (
              <Badge variant={realTimeMetrics.errorRate > 5 ? "destructive" : "default"}>
                {realTimeMetrics.errorRate}% errors
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Today's Performance
          </CardTitle>
          <Target className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {realTimeMetrics.todayConversionRate || 0}%
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-muted-foreground">Conversion Rate</span>
            <Badge variant="outline">
              {sessionStats.today?.completed || 0}/{sessionStats.today?.total || 0}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trends */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Weekly Trend
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {realTimeMetrics.weeklyConversionRate || 0}%
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-muted-foreground">7-day average</span>
            {realTimeMetrics.weeklyConversionRate > realTimeMetrics.todayConversionRate ? (
              <ArrowUp className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-600" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Completion Pie Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Weekly Sessions
          </CardTitle>
          <Users className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-between">
            <div className="flex-1">
              <div className="text-2xl font-bold">{sessionStats.thisWeek?.total || 0}</div>
              <div className="text-xs text-muted-foreground">
                {sessionStats.thisWeek?.completed || 0} completed
              </div>
            </div>
            {sessionCompletionData.length > 0 && (
              <div className="w-16 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sessionCompletionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={15}
                      outerRadius={30}
                      dataKey="value"
                    >
                      {sessionCompletionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      labelStyle={{ display: 'none' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Drop-off Analysis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top Drop-off
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          {dropOffData.length > 0 ? (
            <>
              <div className="text-2xl font-bold">{dropOffData[0]?.value || 0}</div>
              <div className="text-xs text-muted-foreground mb-2">
                {dropOffData[0]?.name || 'No data'}
              </div>
              <div className="space-y-1">
                {dropOffData.slice(0, 3).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-2 text-muted-foreground">
              <div className="text-lg font-bold">0</div>
              <div className="text-xs">No drop-offs</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recent Activity
          </CardTitle>
          <Clock className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentActivity.length}</div>
          <div className="text-xs text-muted-foreground mb-2">Active sessions</div>
          
          {recentActivity.length > 0 && (
            <div className="space-y-1">
              {recentActivity.slice(0, 2).map((activity, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    {activity.isCompleted ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <Clock className="h-3 w-3 text-yellow-600" />
                    )}
                    <span className="truncate">{activity.currentStep}</span>
                  </div>
                  <Badge variant={activity.isCompleted ? "default" : "secondary"} className="text-xs">
                    {activity.device}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}