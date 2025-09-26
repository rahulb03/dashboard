'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconTrendingUp, IconActivity } from '@tabler/icons-react';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { fetchEnhancedFunnelThunk } from '@/redux/tracking/trackingThunks';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const chartConfig = {
  users: {
    label: 'Users'
  },
  step1: {
    label: 'Initial Steps',
    color: 'var(--primary)'
  },
  step2: {
    label: 'Verification',
    color: 'hsl(var(--primary) / 0.8)'
  },
  step3: {
    label: 'Application',
    color: 'hsl(var(--primary) / 0.6)'
  },
  step4: {
    label: 'Processing',
    color: 'hsl(var(--primary) / 0.4)'
  },
  step5: {
    label: 'Completion',
    color: 'hsl(var(--primary) / 0.2)'
  }
};

// Compact Step Analysis Component with Pagination
function StepAnalysisSection({ steps }) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const stepsPerPage = 6;
  const totalPages = Math.ceil(steps.length / stepsPerPage);
  
  const currentSteps = steps.slice(
    currentPage * stepsPerPage, 
    (currentPage + 1) * stepsPerPage
  );
  
  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };
  
  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };
  
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Step Performance Overview</h4>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={totalPages <= 1}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={totalPages <= 1}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Compact Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {currentSteps.map((step, index) => {
          const globalIndex = currentPage * stepsPerPage + index;
          const performanceIndicator = 
            step.performance === 'excellent' ? '✓' :
            step.performance === 'good' ? '•' :
            step.performance === 'average' ? '▲' : '⚠';
          
          const hasIssue = step.performance === 'needs attention' || step.errorRateLevel === 'high';
          const isExcellent = step.performance === 'excellent' && step.errorRateLevel === 'low';
          
          return (
            <div key={step.stepName} className="bg-muted/20 rounded-lg p-3 border hover:bg-muted/30 transition-colors">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-center min-w-[24px]">
                    #{globalIndex + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground truncate">{step.displayName}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                  <span>{performanceIndicator}</span>
                  <span>{step.conversionRate?.toFixed(1)}%</span>
                </div>
              </div>
              
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                <div>
                  <div className="text-muted-foreground">Entered</div>
                  <div className="font-semibold text-foreground">{step.totalEntries?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Completed</div>
                  <div className="font-semibold text-foreground">{step.totalCompletions?.toLocaleString()}</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-2">
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full transition-all duration-300 bg-primary/70"
                    style={{ width: `${step.conversionRate}%` }}
                  />
                </div>
              </div>
              
              {/* Status/Issue */}
              {(hasIssue || isExcellent) && (
                <div className="text-xs text-muted-foreground">
                  {hasIssue && (
                    <div className="flex items-center gap-1">
                      <span>⚠</span>
                      <span>
                        {step.performance === 'needs attention' ? 'Low conversion' : 'High errors'}
                      </span>
                    </div>
                  )}
                  {isExcellent && (
                    <div className="flex items-center gap-1">
                      <span>✓</span>
                      <span>Excellent performance</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Summary Info */}
      <div className="text-xs text-muted-foreground text-center pt-2 border-t">
        {steps.length} total steps • Showing {Math.min(stepsPerPage, steps.length - currentPage * stepsPerPage)} steps
      </div>
    </div>
  );
}

export function PieGraph() {
  const dispatch = useDispatch();
  const { enhancedFunnel, enhancedFunnelLoading, enhancedFunnelError } = useSelector((state) => state.tracking);

  useEffect(() => {
    dispatch(fetchEnhancedFunnelThunk({ dateRange: '7d' }));
  }, [dispatch]);

  // Get detailed funnel steps for analysis
  const funnelStepsAnalysis = React.useMemo(() => {
    if (!enhancedFunnel?.data?.funnel) return [];
    
    const funnelSteps = enhancedFunnel.data.funnel || [];
    
    return funnelSteps.map((step, index) => {
      const nextStep = funnelSteps[index + 1];
      const dropoffToNext = nextStep 
        ? step.totalCompletions - nextStep.totalEntries 
        : 0;
      
      const stepName = step.stepName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      return {
        ...step,
        displayName: stepName,
        dropoffToNext,
        dropoffRate: step.totalEntries > 0 ? ((step.totalEntries - step.totalCompletions) / step.totalEntries * 100).toFixed(1) : '0',
        performance: step.conversionRate >= 90 ? 'excellent' : 
                    step.conversionRate >= 80 ? 'good' : 
                    step.conversionRate >= 60 ? 'average' : 'needs attention',
        errorRateLevel: step.errorRate > 5 ? 'high' : step.errorRate > 2 ? 'medium' : 'low'
      };
    });
  }, [enhancedFunnel]);

  // Process funnel data to show individual steps directly
  const chartData = React.useMemo(() => {
    if (funnelStepsAnalysis.length === 0) return [];
    
    // Take top 8 steps by activity for better visualization
    const topSteps = funnelStepsAnalysis
      .sort((a, b) => (b.totalEntries || 0) - (a.totalEntries || 0))
      .slice(0, 8);
    
    // Generate different shades of primary color for each step
    const colorVariants = [
      'var(--primary)',
      'hsl(var(--primary) / 0.9)',
      'hsl(var(--primary) / 0.8)',
      'hsl(var(--primary) / 0.7)',
      'hsl(var(--primary) / 0.6)',
      'hsl(var(--primary) / 0.5)',
      'hsl(var(--primary) / 0.4)',
      'hsl(var(--primary) / 0.3)'
    ];
    
    return topSteps.map((step, index) => ({
      name: step.displayName,
      value: step.totalEntries || 0,
      fill: colorVariants[index] || 'hsl(var(--primary) / 0.2)',
      conversionRate: step.conversionRate || 0,
      completions: step.totalCompletions || 0,
      errorRate: step.errorRate || 0,
      performance: step.performance,
      stepIndex: step.stepIndex || index
    }));
  }, [funnelStepsAnalysis]);

  const totalUsers = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);
  
  const completionRate = React.useMemo(() => {
    if (!enhancedFunnel?.data?.funnel) return 0;
    
    const funnelSteps = enhancedFunnel.data.funnel || [];
    
    if (funnelSteps.length === 0) return 0;
    
    // Use overall conversion from the API response
    if (enhancedFunnel.data.overallConversion) {
      return enhancedFunnel.data.overallConversion;
    }
    
    // Calculate from steps if not provided
    const firstStep = funnelSteps[0];
    const lastStep = funnelSteps[funnelSteps.length - 1];
    
    if (!firstStep || !lastStep) return 0;
    
    const totalStarted = firstStep.totalEntries || 0;
    const totalCompleted = lastStep.totalCompletions || 0;
    
    return totalStarted > 0 ? ((totalCompleted / totalStarted) * 100).toFixed(1) : 0;
  }, [enhancedFunnel]);

  if (enhancedFunnelError) {
    return (
      <Card className='@container/card'>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <IconActivity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Failed to load funnel data</p>
            <p className="text-xs mt-1">{enhancedFunnelError}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconActivity className="h-5 w-5" />
          Funnel Analytics
        </CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            {enhancedFunnelLoading ? 'Loading funnel data...' : `Step performance breakdown across ${enhancedFunnel?.data?.funnel?.length || 17} funnel steps`}
          </span>
          <span className='@[540px]/card:hidden'>
            {enhancedFunnelLoading ? 'Loading...' : 'Step performance breakdown'}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        {enhancedFunnelLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-pulse">
              <div className="w-48 h-48 bg-muted rounded-full mx-auto mb-4" />
              <div className="h-4 bg-muted rounded w-32 mx-auto" />
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            <div className="text-center">
              <IconActivity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm mb-2">No funnel data available</p>
              <p className="text-xs">Funnel analytics will appear when users start the process</p>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className='mx-auto aspect-square h-[250px]'
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                        <p className="font-medium text-foreground mb-1">{data.name}</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Users:</span>
                            <span className="font-medium">{data.value.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Completed:</span>
                            <span className="font-medium">{data.completions.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Conversion:</span>
                            <span className="font-medium">{data.conversionRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Error Rate:</span>
                            <span className="font-medium">{data.errorRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                dataKey='value'
                nameKey='name'
                innerRadius={60}
                strokeWidth={2}
                stroke='var(--background)'
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor='middle'
                          dominantBaseline='middle'
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 12}
                            className='fill-foreground text-2xl font-bold'
                          >
                            {chartData.length}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 8}
                            className='fill-muted-foreground text-sm'
                          >
                            Active
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className='fill-muted-foreground text-xs'
                          >
                            Steps
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
        
      </CardContent>
      <CardFooter className='flex-col gap-3 text-sm'>
        {!enhancedFunnelLoading && chartData.length > 0 && (
          <>
            <div className='flex items-center gap-2 leading-none font-medium'>
              Most active step: {chartData[0]?.name}
              <IconTrendingUp className='h-4 w-4' />
            </div>
            <div className='text-muted-foreground leading-none mb-3'>
              Total funnel activity: {totalUsers.toLocaleString()} • {chartData.length} active steps
            </div>
            
            {/* Top Funnel Steps Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {chartData.slice(0, 6).map((step, index) => (
                <div key={step.name} className="bg-muted/30 rounded-lg p-3 border">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: step.fill }}
                    />
                    <span className="font-medium text-foreground text-xs">{step.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Users</div>
                      <div className="font-medium text-foreground">{step.value.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Conversion</div>
                      <div className="font-medium text-foreground">{step.conversionRate.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {funnelStepsAnalysis.length > chartData.length && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                Showing top {chartData.length} steps by activity • {funnelStepsAnalysis.length - chartData.length} more steps in detailed analysis below
              </div>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
