'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  RefreshCw, 
  AlertTriangle,
  ArrowUpIcon,
  ArrowDownIcon,
  Clock,
  Users,
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
  fetchEnhancedFunnelThunk,
  fetchTrendAnalysisThunk
} from '@/redux/tracking/trackingThunks';
import { clearAnalytics } from '@/redux/tracking/trackingSlice';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FunnelStep = ({ step, index, totalSteps }) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground text-sm font-medium">
          {index + 1}
        </div>
        <div>
          <h4 className="font-medium">{step.stepName}</h4>
          <p className="text-sm text-muted-foreground">
            {step.totalReached} users reached this step
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold">
          {step.conversionRate}%
        </div>
        <div className="text-sm text-muted-foreground">
          {step.totalCompleted} completed
        </div>
      </div>
    </div>
  );
};

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

const UniversalFunnelVisualization = ({ funnelData }) => {
  console.log('🔍 Funnel Data Received:', funnelData);
  
  if (!funnelData) {
    console.log('❌ No funnel data provided');
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No funnel data available</p>
        <p className="text-sm">Waiting for API response...</p>
      </div>
    );
  }
  
  // Smart data extraction - works with your actual API structure
  let stepData = null;
  
  // Handle the actual API response format
  if (funnelData.funnel && Array.isArray(funnelData.funnel)) {
    console.log('✅ Found funnel array with', funnelData.funnel.length, 'steps');
    stepData = funnelData.funnel;
  } else if (funnelData.trends) {
    console.log('✅ Found trends data');
    stepData = funnelData.trends;
  } else if (funnelData.data?.trends) {
    console.log('✅ Found nested trends data');
    stepData = funnelData.data.trends;
  } else if (funnelData.steps) {
    console.log('✅ Found steps data');
    stepData = funnelData.steps;
  } else if (Array.isArray(funnelData)) {
    console.log('✅ Found array data');
    stepData = funnelData;
  } else {
    console.log('✅ Using raw data');
    stepData = funnelData;
  }
  
  console.log('📊 Extracted Step Data:', stepData);
  
  if (!stepData || (typeof stepData !== 'object' && !Array.isArray(stepData))) {
    console.log('❌ Invalid step data type');
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50 text-yellow-500" />
        <p>Invalid data format received</p>
        <p className="text-sm">Expected object or array, got {typeof stepData}</p>
      </div>
    );
  }
  
  // Process the funnel data to create meaningful insights
  let stepInsights = [];
  
  if (Array.isArray(stepData)) {
    console.log('🔄 Processing array format with', stepData.length, 'steps');
    // Handle your actual API format - array of step objects
    stepInsights = stepData.map((step, index) => {
      const stepName = step.stepName || step.name || step.step || `Step ${index + 1}`;
      const totalEntries = step.totalEntries || step.users || step.count || 0;
      const totalCompletions = step.totalCompletions || step.completions || 0;
      const conversionRate = step.conversionRate || step.conversion || step.rate || 0;
      const errorRate = step.errorRate || step.errors || 0;
      const dropOffRate = step.dropOffRate || (100 - conversionRate);
      const avgTimeOnStep = step.avgTimeOnStep || 0;
      
      return {
        stepName: stepName.toString().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        originalName: stepName,
        stepIndex: step.stepIndex || index,
        totalEntries,
        totalCompletions,
        conversionRate,
        errorRate,
        dropOffRate,
        avgTimeOnStep,
        completedSessions: totalCompletions,
        dropOffCount: Math.max(0, totalEntries - totalCompletions)
      };
    });
    
    // Show ALL steps regardless of activity for complete funnel view
    // stepInsights = stepInsights.filter(step => step.totalEntries > 0 || step.totalCompletions > 0);
    
  } else if (typeof stepData === 'object') {
    console.log('🔄 Processing object format');
    // Handle object format - each key is a step name
    stepInsights = Object.entries(stepData)
      .map(([stepName, stepDataItem]) => {
        console.log(`Processing step: ${stepName}`, stepDataItem);
        
        // Handle different data structures
        let latestData;
        if (Array.isArray(stepDataItem)) {
          // If it's an array, take the latest (last) entry
          latestData = stepDataItem[stepDataItem.length - 1];
        } else if (typeof stepDataItem === 'object') {
          // If it's an object, use it directly
          latestData = stepDataItem;
        } else {
          console.log(`⚠️ Unexpected step data format for ${stepName}:`, typeof stepDataItem);
          return null;
        }
        
        if (!latestData) return null;
        
        const totalEntries = latestData.totalEntries || latestData.users || latestData.count || 0;
        const conversionRate = latestData.conversionRate || latestData.conversion || latestData.rate || 0;
        const errorRate = latestData.errorRate || latestData.errors || 0;
        const completedSessions = latestData.completedSessions || Math.round((conversionRate / 100) * totalEntries);
        
        return {
          stepName: stepName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          originalName: stepName,
          totalEntries,
          conversionRate,
          errorRate,
          completedSessions,
          dropOffCount: totalEntries - completedSessions
        };
      })
      .filter(Boolean)
      .filter(step => step.totalEntries > 0 || step.completedSessions > 0);
  }
  
  // Sort the steps in logical funnel order based on stepIndex or predefined order
  stepInsights.sort((a, b) => {
    // If stepIndex is available, use it for sorting
    if (a.stepIndex !== undefined && b.stepIndex !== undefined) {
      return a.stepIndex - b.stepIndex;
    }
    
    // Fallback to predefined order for your specific funnel steps
    const stepOrder = {
      'welcome': 1, 'phone': 2, 'otp': 3, 'application': 4, 'cibil': 5,
      'payment': 6, 'cibil otp': 7, 'loan amount': 8, 'apply for loan': 9,
      'loan application success': 10, 'document payment': 11, 'payment successfully': 12,
      'upload documents': 13, 'document upload success': 14, 'loan approved': 15,
      'signup': 16, 'cibil skip': 17
    };
    
    const aOrder = stepOrder[a.stepName.toLowerCase()] || 999;
    const bOrder = stepOrder[b.stepName.toLowerCase()] || 999;
    
    // Primary sort by predefined order, secondary by totalEntries
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // If same order or both are 999, sort by activity level
    return (b.totalEntries + b.totalCompletions) - (a.totalEntries + a.totalCompletions);
  });
  
  console.log('📋 Final Step Insights:', stepInsights);
  
  if (stepInsights.length === 0) {
    console.log('⚠️ No valid step insights found. Raw funnel data:', funnelData);
    
    // Show all steps even if they have zero activity for better visibility
    if (Array.isArray(stepData) && stepData.length > 0) {
      console.log('🔄 Creating insights for all steps including zero-activity ones');
      stepInsights = stepData.map((step, index) => {
        const stepName = step.stepName || step.name || step.step || `Step ${index + 1}`;
        const totalEntries = step.totalEntries || 0;
        const totalCompletions = step.totalCompletions || 0;
        const conversionRate = step.conversionRate || 0;
        const errorRate = step.errorRate || 0;
        
        return {
          stepName: stepName.toString().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          originalName: stepName,
          stepIndex: step.stepIndex || index,
          totalEntries,
          totalCompletions,
          conversionRate,
          errorRate,
          completedSessions: totalCompletions,
          dropOffCount: Math.max(0, totalEntries - totalCompletions)
        };
      }).sort((a, b) => a.stepIndex - b.stepIndex);
      
      // Recalculate metrics with all steps
      const maxEntries = Math.max(1, ...stepInsights.map(step => Math.max(step.totalEntries, step.totalCompletions)));
      const totalUsers = funnelData.totalUsers || stepInsights.reduce((sum, step) => sum + step.totalEntries, 0);
      const totalConversions = funnelData.completedUsers || stepInsights.reduce((sum, step) => sum + step.totalCompletions, 0);
      const overallConversion = funnelData.overallConversion || 0;
      
      console.log('📊 All Steps Metrics:', { totalSteps: stepInsights.length, totalUsers, totalConversions, overallConversion });
    } else {
      return (
        <div className="text-center py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Funnel Data Found</h3>
            <p className="text-yellow-700 mb-4">
              Unable to process the funnel data. This could be due to:
            </p>
            <ul className="text-sm text-yellow-600 text-left max-w-md mx-auto space-y-1">
              <li>• No users have interacted with the funnel yet</li>
              <li>• Data format doesn’t match expected structure</li>
              <li>• API returned empty or invalid data</li>
            </ul>
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left font-mono">
              <strong>Debug Info:</strong><br/>
              Raw data keys: {Object.keys(funnelData).join(', ')}<br/>
              Step data type: {Array.isArray(stepData) ? 'array' : typeof stepData}<br/>
              {Array.isArray(stepData) ? `Array length: ${stepData.length}` : `Object keys: ${typeof stepData === 'object' ? Object.keys(stepData).join(', ') : 'N/A'}`}
            </div>
          </div>
        </div>
      );
    }
  }
  
  // Calculate meaningful metrics from the actual data
  const maxEntries = Math.max(1, ...stepInsights.map(step => Math.max(step.totalEntries, step.totalCompletions)));
  
  // Use the API's provided totals when available, otherwise calculate
  const totalUsers = funnelData.totalUsers || stepInsights.reduce((sum, step) => sum + step.totalEntries, 0);
  const totalConversions = funnelData.completedUsers || stepInsights.reduce((sum, step) => sum + step.totalCompletions, 0);
  const overallConversion = funnelData.overallConversion || 
                           (totalUsers > 0 ? (totalConversions / totalUsers) * 100 : 0);
  
  console.log('📊 Final Metrics:', {
    totalSteps: stepInsights.length,
    totalUsers,
    totalConversions,
    overallConversion: overallConversion.toFixed(1) + '%',
    stepsWithActivity: stepInsights.filter(s => s.totalEntries > 0 || s.totalCompletions > 0).length,
    dateRange: funnelData.dateRange
  });
  
  const [selectedFunnelRows, setSelectedFunnelRows] = useState(new Set());
  
  const handleSelectAllFunnel = (checked) => {
    if (checked) {
      setSelectedFunnelRows(new Set(stepInsights.map((_, index) => index)));
    } else {
      setSelectedFunnelRows(new Set());
    }
  };
  
  const handleSelectFunnelRow = (index, checked) => {
    const newSelected = new Set(selectedFunnelRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedFunnelRows(newSelected);
  };
  
  return (
    <div className="space-y-8">
      {/* Simple Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Entered funnel</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Completed funnel</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallConversion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Overall success rate</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Funnel Performance Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Funnel Performance Overview</h3>
          <div className="text-sm text-muted-foreground">
            {stepInsights.length} steps • {totalUsers.toLocaleString()} users
          </div>
        </div>
        
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] px-4">
                  <Checkbox
                    checked={selectedFunnelRows.size === stepInsights.length && stepInsights.length > 0}
                    onCheckedChange={handleSelectAllFunnel}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                  />
                </TableHead>
                <TableHead className="w-[200px] px-4"><span className="text-xs font-medium text-muted-foreground uppercase">Step Name</span></TableHead>
                <TableHead className="text-center px-4"><span className="text-xs font-medium text-muted-foreground uppercase">Conversion</span></TableHead>
                <TableHead className="text-center px-4"><span className="text-xs font-medium text-muted-foreground uppercase">Entered</span></TableHead>
                <TableHead className="text-center px-4"><span className="text-xs font-medium text-muted-foreground uppercase">Completed</span></TableHead>
                <TableHead className="text-center px-4"><span className="text-xs font-medium text-muted-foreground uppercase">Error Rate</span></TableHead>
                <TableHead className="px-4"><span className="text-xs font-medium text-muted-foreground uppercase">Activity</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stepInsights.map((step, index) => {
                const conversionRate = step.conversionRate;
                const isHighError = step.errorRate > 10;
                const activityPercent = maxEntries > 0 ? (step.totalEntries / maxEntries) * 100 : 0;
                
                return (
                  <TableRow key={step.originalName}>
                    <TableCell className="px-4">
                      <Checkbox
                        checked={selectedFunnelRows.has(index)}
                        onCheckedChange={(checked) => handleSelectFunnelRow(index, checked)}
                        aria-label="Select row"
                        className="translate-y-[2px]"
                      />
                    </TableCell>
                    <TableCell className="px-4">
                      <div>
                        <span className="font-medium">{step.stepName}</span>
                        {isHighError && (
                          <div className="text-xs text-muted-foreground">
                            High error rate
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <span className="font-bold">{conversionRate.toFixed(1)}%</span>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <span className="font-medium">{step.totalEntries.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <span className="font-medium">{step.totalCompletions.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <span>{step.errorRate.toFixed(1)}%</span>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2 min-w-[100px]">
                          <div 
                            className="h-2 rounded-full bg-foreground"
                            style={{ width: `${activityPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {activityPercent.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Compact Flow Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stepInsights.length}</div>
              <div className="text-xs text-muted-foreground">Total Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {stepInsights.filter(s => s.conversionRate >= 60).length}
              </div>
              <div className="text-xs text-muted-foreground">High Performance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {stepInsights.filter(s => s.conversionRate < 40).length}
              </div>
              <div className="text-xs text-muted-foreground">Needs Improvement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {stepInsights.filter(s => s.errorRate > 10).length}
              </div>
              <div className="text-xs text-muted-foreground">High Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function TrackingAnalytics() {
  const dispatch = useDispatch();
  const {
    enhancedFunnel,
    enhancedFunnelLoading,
    enhancedFunnelError
  } = useSelector((state) => state.tracking);

  const [funnelDateRange, setFunnelDateRange] = useState('7d');

  useEffect(() => {
    // Fetch analytics data on mount
    dispatch(fetchEnhancedFunnelThunk({ dateRange: funnelDateRange }));
  }, [dispatch, funnelDateRange]);

  const handleRefreshFunnel = () => {
    dispatch(fetchEnhancedFunnelThunk({ dateRange: funnelDateRange, forceRefresh: true }));
  };

  const clearErrorHandler = () => {
    dispatch(clearAnalytics());
  };

  return (
    <div className="space-y-6">


      {/* Enhanced Funnel Analytics - Full Width */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Conversion Funnel Analysis
          </h2>
          <div className="flex items-center gap-2">
            <Select value={funnelDateRange} onValueChange={setFunnelDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Today</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshFunnel}
              disabled={enhancedFunnelLoading}
            >
              <RefreshCw className={`h-4 w-4 ${enhancedFunnelLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {enhancedFunnelLoading && !enhancedFunnel ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : enhancedFunnel ? (
          <UniversalFunnelVisualization funnelData={enhancedFunnel} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Funnel Data Available</h3>
            <p className="text-sm">Waiting for API response or configure your funnel tracking...</p>
          </div>
        )}
      </div>

      {/* Goal Tracking - Future Enhancement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal Tracking & KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-medium mb-2">Conversion Goals</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Set target conversion rates and track progress towards your goals.
              </p>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
            
            <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-medium mb-2">Performance KPIs</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor key performance indicators and receive alerts for anomalies.
              </p>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
            
            <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-medium mb-2">Time-based Analysis</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Analyze user behavior patterns across different time periods.
              </p>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
