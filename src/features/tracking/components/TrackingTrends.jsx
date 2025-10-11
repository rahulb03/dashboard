'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  TrendingUp, 
  RefreshCw, 
  Target,
  AlertTriangle,
  ArrowUpIcon,
  ArrowDownIcon,
  Clock,
  Activity
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  fetchTrendAnalysisThunk
} from '@/redux/tracking/trackingThunks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const UniversalTrendVisualization = ({ trendData }) => {
  if (!trendData) return null;
  
  // Smart data extraction - works with any API structure
  let stepData = null;
  
  // Try different possible structures
  if (trendData.trends) {
    stepData = trendData.trends;
  } else if (trendData.data?.trends) {
    stepData = trendData.data.trends;
  } else {
    stepData = trendData;
  }
  
  if (!stepData || typeof stepData !== 'object') return null;
  
  const stepNames = Object.keys(trendData.trends);
  if (stepNames.length === 0) return null;
  
  // Get the date range from the first step
  const firstStep = trendData.trends[stepNames[0]];
  if (!firstStep || firstStep.length === 0) return null;
  
  // Process daily performance data
  const dailyAnalysis = firstStep.map((_, dateIndex) => {
    const currentDate = firstStep[dateIndex]?.date;
    if (!currentDate) return null;
    
    let totalEntries = 0;
    let totalErrors = 0;
    let stepActivity = [];
    
    stepNames.forEach(stepName => {
      const stepData = trendData.trends[stepName];
      if (stepData && stepData[dateIndex]) {
        const dayData = stepData[dateIndex];
        const entries = dayData.totalEntries || 0;
        const errors = Math.round((dayData.errorRate / 100) * entries) || 0;
        
        totalEntries += entries;
        totalErrors += errors;
        
        if (entries > 0) {
          stepActivity.push({
            stepName: stepName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            entries,
            conversionRate: dayData.conversionRate || 0,
            errorRate: dayData.errorRate || 0
          });
        }
      }
    });
    
    const errorRate = totalEntries > 0 ? (totalErrors / totalEntries) * 100 : 0;
    const avgConversionRate = stepActivity.length > 0 
      ? stepActivity.reduce((sum, step) => sum + step.conversionRate, 0) / stepActivity.length 
      : 0;
    
    return {
      date: currentDate,
      totalEntries,
      totalErrors,
      errorRate,
      avgConversionRate,
      stepActivity: stepActivity.sort((a, b) => b.entries - a.entries),
      activeSteps: stepActivity.length
    };
  }).filter(Boolean);
  
  if (dailyAnalysis.length === 0) return null;
  
  const [selectedRows, setSelectedRows] = useState(new Set());
  
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(dailyAnalysis.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };
  
  const handleSelectRow = (index, checked) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
  };
  
  const maxEntries = Math.max(...dailyAnalysis.map(d => d.totalEntries));
  const totalPeriodEntries = dailyAnalysis.reduce((sum, d) => sum + d.totalEntries, 0);
  const avgDailyConversion = dailyAnalysis.reduce((sum, d) => sum + d.avgConversionRate, 0) / dailyAnalysis.length;
  const avgDailyErrors = dailyAnalysis.reduce((sum, d) => sum + d.errorRate, 0) / dailyAnalysis.length;
  
  // Identify trends
  const recentDays = dailyAnalysis.slice(-3);
  const olderDays = dailyAnalysis.slice(0, -3);
  const recentAvg = recentDays.reduce((sum, d) => sum + d.totalEntries, 0) / recentDays.length;
  const olderAvg = olderDays.length > 0 ? olderDays.reduce((sum, d) => sum + d.totalEntries, 0) / olderDays.length : recentAvg;
  const trendDirection = recentAvg > olderAvg ? 'increasing' : recentAvg < olderAvg ? 'decreasing' : 'stable';
  const trendPercentage = olderAvg > 0 ? Math.abs((recentAvg - olderAvg) / olderAvg) * 100 : 0;
  
  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPeriodEntries}</div>
            <p className="text-xs text-muted-foreground">Total user entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDailyConversion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDailyErrors.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Error percentage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trendDirection === 'increasing' ? '↗' : trendDirection === 'decreasing' ? '↘' : '→'}
            </div>
            <p className="text-xs text-muted-foreground">{trendDirection}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Daily Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Daily Performance Timeline
        </h3>
        
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] px-4">
                  <Checkbox
                    checked={selectedRows.size === dailyAnalysis.length && dailyAnalysis.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                  />
                </TableHead>
                <TableHead className="w-[180px] px-4"><span className="text-xs font-medium text-muted-foreground uppercase">Date</span></TableHead>
                <TableHead className="text-center px-4"><span className="text-xs font-medium text-muted-foreground uppercase">Users</span></TableHead>
                <TableHead className="text-center px-4"><span className="text-xs font-medium text-muted-foreground uppercase">Active Steps</span></TableHead>
                <TableHead className="text-center px-4"><span className="text-xs font-medium text-muted-foreground uppercase">Conversion</span></TableHead>
                <TableHead className="text-center px-4"><span className="text-xs font-medium text-muted-foreground uppercase">Error Rate</span></TableHead>
                <TableHead className="px-4"><span className="text-xs font-medium text-muted-foreground uppercase">Activity</span></TableHead>
                <TableHead className="px-4"><span className="text-xs font-medium text-muted-foreground uppercase">Top Steps</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyAnalysis.map((day, index) => {
                const barWidth = maxEntries > 0 ? (day.totalEntries / maxEntries) * 100 : 0;
                const isToday = new Date(day.date).toDateString() === new Date().toDateString();
                const dayOfWeek = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
                const dayMonth = new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' });
                
                const prevDay = dailyAnalysis[index - 1];
                const dailyChange = prevDay && prevDay.totalEntries > 0 
                  ? ((day.totalEntries - prevDay.totalEntries) / prevDay.totalEntries) * 100 
                  : 0;
                
                return (
                  <TableRow key={day.date}>
                    <TableCell className="px-4">
                      <Checkbox
                        checked={selectedRows.has(index)}
                        onCheckedChange={(checked) => handleSelectRow(index, checked)}
                        aria-label="Select row"
                        className="translate-y-[2px]"
                      />
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {dayOfWeek}, {dayMonth}
                        </span>
                        {isToday && <Badge className="text-xs">Today</Badge>}
                        {Math.abs(dailyChange) > 5 && (
                          <span className="flex items-center text-xs text-muted-foreground">
                            {dailyChange > 0 ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                            {Math.abs(dailyChange).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <span className="font-bold">{day.totalEntries}</span>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <span>{day.activeSteps}</span>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <span className="font-medium">{day.avgConversionRate.toFixed(1)}%</span>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <span>{day.errorRate.toFixed(1)}%</span>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2 min-w-[80px]">
                          <div 
                            className="bg-foreground h-2 rounded-full"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {barWidth.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      {day.stepActivity.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {day.stepActivity.slice(0, 2).map((step) => (
                            <Badge key={step.stepName} variant="outline" className="text-xs">
                              {step.stepName.split(' ')[0]} ({step.entries})
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No activity</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Trend Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h6 className="font-medium mb-2">Activity Trend</h6>
              <p className="text-muted-foreground">
                User activity is {trendDirection}
                {trendPercentage > 1 && ` by ${trendPercentage.toFixed(0)}%`} 
                over the recent period compared to earlier days.
              </p>
            </div>
            <div>
              <h6 className="font-medium mb-2">Performance Insight</h6>
              <p className="text-muted-foreground">
                {avgDailyConversion > 80 
                  ? 'Excellent conversion rates across the funnel' 
                  : avgDailyConversion > 60 
                  ? 'Good conversion performance with room for improvement'
                  : 'Conversion rates need attention - consider optimizing key steps'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function TrackingTrends() {
  const dispatch = useDispatch();
  const {
    trendAnalysis,
    trendAnalysisLoading,
    trendAnalysisError
  } = useSelector((state) => state.tracking);

  const [trendPeriod, setTrendPeriod] = useState('daily');
  const [trendPeriods, setTrendPeriods] = useState(7);

  useEffect(() => {
    // Fetch trends data on mount
    console.log('🔍 Fetching trend analysis with params:', { period: trendPeriod, periods: trendPeriods });
    console.log('📅 Current date:', new Date().toISOString());
    dispatch(fetchTrendAnalysisThunk({ period: trendPeriod, periods: trendPeriods }));
  }, [dispatch, trendPeriod, trendPeriods]);

  // Debug: Log the trend data when it changes
  useEffect(() => {
    if (trendAnalysis) {
      console.log('📊 Trend analysis data received:', trendAnalysis);
      if (trendAnalysis.trends) {
        const firstStepKey = Object.keys(trendAnalysis.trends)[0];
        if (firstStepKey && trendAnalysis.trends[firstStepKey].length > 0) {
          const dates = trendAnalysis.trends[firstStepKey].map(d => d.date);
          console.log('📆 Date range in data:', { first: dates[0], last: dates[dates.length - 1] });
        }
      }
    }
  }, [trendAnalysis]);

  const handleRefreshTrends = () => {
    dispatch(fetchTrendAnalysisThunk({ period: trendPeriod, periods: trendPeriods, forceRefresh: true }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={trendPeriod} onValueChange={setTrendPeriod}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={trendPeriods.toString()} onValueChange={(value) => setTrendPeriods(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshTrends}
            disabled={trendAnalysisLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${trendAnalysisLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Content */}
      {trendAnalysisLoading && !trendAnalysis ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      ) : trendAnalysis ? (
        <UniversalTrendVisualization trendData={trendAnalysis} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Trend Data Available</h3>
          <p className="text-sm">Waiting for API response or enable trend tracking...</p>
        </div>
      )}
    </div>
  );
}
