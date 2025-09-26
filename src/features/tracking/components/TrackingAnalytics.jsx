'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const conversionColor = step.conversionRate >= 80 ? 'text-green-600' : 
                         step.conversionRate >= 60 ? 'text-yellow-600' : 'text-red-600';
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
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
        <div className={`text-lg font-bold ${conversionColor}`}>
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
        <div className="text-center p-4 bg-card border border-border rounded-lg">
          <div className="text-2xl font-bold text-foreground">{totalPeriodEntries}</div>
          <div className="text-sm text-muted-foreground">Total Activity</div>
        </div>
        <div className="text-center p-4 bg-card border border-border rounded-lg">
          <div className="text-2xl font-bold text-foreground">{avgDailyConversion.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Avg Conversion</div>
        </div>
        <div className="text-center p-4 bg-card border border-border rounded-lg">
          <div className="text-2xl font-bold text-foreground">{avgDailyErrors.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Avg Error Rate</div>
        </div>
        <div className="text-center p-4 bg-card border border-border rounded-lg">
          <div className="text-2xl font-bold text-foreground">
            {trendDirection === 'increasing' ? '↗' : trendDirection === 'decreasing' ? '↘' : '→'}
          </div>
          <div className="text-sm text-muted-foreground">Trend</div>
        </div>
      </div>
      
      {/* Daily Timeline */}
      <div className="space-y-4">
        <h5 className="font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Daily Performance Timeline
        </h5>
        
        <div className="space-y-3">
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
              <div key={day.date} className={`p-4 bg-card border border-border rounded-lg ${
                isToday ? 'ring-2 ring-primary' : ''
              } hover:bg-accent/50 transition-colors`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      {dayOfWeek}, {dayMonth}
                      {isToday && <Badge className="ml-2 text-xs">Today</Badge>}
                    </div>
                    {Math.abs(dailyChange) > 5 && (
                      <div className={`flex items-center text-xs ${
                        dailyChange > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {dailyChange > 0 ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                        {Math.abs(dailyChange).toFixed(0)}%
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{day.totalEntries} users</div>
                    <div className="text-xs text-muted-foreground">{day.activeSteps} active steps</div>
                  </div>
                </div>
                
                {/* Visual Activity Bar */}
                <div className="w-full bg-muted rounded-full h-2 mb-3">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Conversion:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {day.avgConversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Errors:</span>
                    <span className="ml-2 font-medium text-foreground">
                      {day.errorRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {/* Top Steps for the Day */}
                {day.stepActivity.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-muted-foreground mb-2">Most Active Steps:</div>
                    <div className="flex flex-wrap gap-1">
                      {day.stepActivity.slice(0, 3).map((step) => (
                        <Badge key={step.stepName} variant="outline" className="text-xs">
                          {step.stepName} ({step.entries})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Trend Insights */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h5 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
          <TrendingUp className="h-5 w-5" />
          Trend Analysis
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h6 className="font-medium mb-2 text-foreground">Activity Trend</h6>
            <p className="text-muted-foreground">
              User activity is {trendDirection}
              {trendPercentage > 1 && ` by ${trendPercentage.toFixed(0)}%`} 
              over the recent period compared to earlier days.
            </p>
          </div>
          <div>
            <h6 className="font-medium mb-2 text-foreground">Performance Insight</h6>
            <p className="text-muted-foreground">
              {avgDailyConversion > 80 
                ? 'Excellent conversion rates across the funnel' 
                : avgDailyConversion > 60 
                ? 'Good conversion performance with room for improvement'
                : 'Conversion rates need attention - consider optimizing key steps'}
            </p>
          </div>
        </div>
      </div>
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
  
  return (
    <div className="space-y-8">
      {/* Simple Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-foreground">{totalUsers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-foreground">{totalConversions.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Conversions</div>
            </div>
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-foreground">{overallConversion.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Overall Conversion Rate</div>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </div>
      
      {/* Funnel Performance Overview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">Funnel Performance Overview</h3>
          <div className="text-sm text-muted-foreground">
            {stepInsights.length} steps • {totalUsers.toLocaleString()} users
          </div>
        </div>
        
        {/* Step List */}
        <div className="space-y-4">
          {stepInsights.map((step, index) => {
            const conversionRate = step.conversionRate;
            const isHighError = step.errorRate > 10;
            const nextStep = stepInsights[index + 1];
            const dropoffRate = nextStep ? step.conversionRate - nextStep.conversionRate : 0;
            
            return (
              <div key={step.originalName} className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-4">
                  {/* Step Number */}
                  <div className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  
                  {/* Step Details */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    {/* Step Name */}
                    <div>
                      <h4 className="font-medium text-foreground text-sm mb-1">
                        {step.stepName}
                      </h4>
                      {isHighError && (
                        <div className="text-xs text-muted-foreground">
                          High error rate ({step.errorRate.toFixed(1)}%)
                        </div>
                      )}
                    </div>
                    
                    {/* Metrics */}
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">
                        {conversionRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Conversion</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium text-foreground">
                        {step.totalEntries.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Entered</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium text-foreground">
                        {step.totalCompletions.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Activity: {((step.totalEntries / maxEntries) * 100).toFixed(0)}% of peak</span>
                    {dropoffRate > 0 && index < stepInsights.length - 1 && (
                      <span>{dropoffRate.toFixed(1)}% drop to next step</span>
                    )}
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full bg-foreground"
                      style={{ width: `${maxEntries > 0 ? (step.totalEntries / maxEntries) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Compact Flow Summary */}
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{stepInsights.length}</div>
              <div className="text-xs text-muted-foreground">Steps</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {stepInsights.filter(s => s.conversionRate >= 60).length}
              </div>
              <div className="text-xs text-muted-foreground">Good</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {stepInsights.filter(s => s.conversionRate < 40).length}
              </div>
              <div className="text-xs text-muted-foreground">Poor</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {stepInsights.filter(s => s.errorRate > 10).length}
              </div>
              <div className="text-xs text-muted-foreground">Errors</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TrackingAnalytics() {
  const dispatch = useDispatch();
  const {
    enhancedFunnel,
    enhancedFunnelLoading,
    enhancedFunnelError,
    trendAnalysis,
    trendAnalysisLoading,
    trendAnalysisError
  } = useSelector((state) => state.tracking);


  const [funnelDateRange, setFunnelDateRange] = useState('7d');
  const [trendPeriod, setTrendPeriod] = useState('daily');
  const [trendPeriods, setTrendPeriods] = useState(7);

  useEffect(() => {
    // Fetch analytics data on mount
    dispatch(fetchEnhancedFunnelThunk({ dateRange: funnelDateRange }));
    dispatch(fetchTrendAnalysisThunk({ period: trendPeriod, periods: trendPeriods }));
  }, [dispatch, funnelDateRange, trendPeriod, trendPeriods]);

  const handleRefreshFunnel = () => {
    dispatch(fetchEnhancedFunnelThunk({ dateRange: funnelDateRange, forceRefresh: true }));
  };

  const handleRefreshTrends = () => {
    dispatch(fetchTrendAnalysisThunk({ period: trendPeriod, periods: trendPeriods, forceRefresh: true }));
  };

  const clearErrorHandler = () => {
    dispatch(clearAnalytics());
  };

  return (
    <div className="space-y-6">
      {/* Error State */}
      {(enhancedFunnelError || trendAnalysisError) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading analytics: {enhancedFunnelError || trendAnalysisError}
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
      )}


      {/* Enhanced Funnel Analytics - Full Width */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Conversion Funnel Analysis
            </CardTitle>
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
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Trend Analysis - Full Width */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Trends & Timeline
            </CardTitle>
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshTrends}
                disabled={trendAnalysisLoading}
              >
                <RefreshCw className={`h-4 w-4 ${trendAnalysisLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

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
