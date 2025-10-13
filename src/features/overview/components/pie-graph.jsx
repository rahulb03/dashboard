'use client';

import * as React from 'react';
import { useSelector } from 'react-redux';
import { IconTrendingUp } from '@tabler/icons-react';
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

// Generate mock funnel data with realistic completion rates
const generateMockFunnelData = () => {
  const totalSessions = 1000;
  const completed = Math.floor(totalSessions * 0.25); // 25% completion rate
  const abandoned = Math.floor(totalSessions * 0.45); // 45% abandon
  const inProgress = Math.floor(totalSessions * 0.20); // 20% in progress
  const failed = totalSessions - completed - abandoned - inProgress; // remainder failed
  
  return [
    { status: 'completed', count: completed, fill: 'hsl(var(--chart-1))' },
    { status: 'abandoned', count: abandoned, fill: 'hsl(var(--chart-2))' },
    { status: 'inprogress', count: inProgress, fill: 'hsl(var(--chart-3))' },
    { status: 'failed', count: failed, fill: 'hsl(var(--chart-4))' }
  ];
};

const mockChartData = generateMockFunnelData();

const chartConfig = {
  sessions: {
    label: 'Sessions'
  },
  completed: {
    label: 'Completed',
    color: 'hsl(142, 76%, 36%)' // Green
  },
  abandoned: {
    label: 'Abandoned',
    color: 'hsl(0, 84%, 60%)' // Red
  },
  inprogress: {
    label: 'In Progress',
    color: 'hsl(47, 96%, 53%)' // Yellow
  },
  failed: {
    label: 'Failed',
    color: 'hsl(240, 10%, 50%)' // Gray
  },
  started: {
    label: 'Started',
    color: 'hsl(220, 70%, 50%)' // Blue
  }
};

export function PieGraph() {
  const { 
    funnelAnalytics, 
    sessions: trackingSessions, 
    sessionsData,
    dashboard,
    loading 
  } = useSelector((state) => state.tracking);
  
  // Build chart data from funnel analytics or session data
  const chartData = React.useMemo(() => {
    // console.log('🥧 PieGraph - API Data Debug:');
    // console.log('funnelAnalytics:', funnelAnalytics);
    // console.log('dashboard:', dashboard);
    // console.log('sessionsData:', sessionsData);
    // console.log('trackingSessions:', trackingSessions?.length || 0);
    
    // Try to use API session data first
    const apiSessions = sessionsData?.data || trackingSessions;
    
    if (Array.isArray(apiSessions) && apiSessions.length > 0) {
      // console.log('📊 Using API session data:', apiSessions.length, 'sessions');
      
      // Group sessions by completion status
      const grouped = { completed: 0, inprogress: 0, abandoned: 0, failed: 0 };
      
      apiSessions.forEach((session) => {
        if (session.isCompleted) {
          grouped.completed += 1;
        } else if (session.currentStep && session.currentStep !== 'start' && session.currentStep !== 'welcome') {
          grouped.inprogress += 1;
        } else if (session.hasError || session.errorStep) {
          grouped.failed += 1;
        } else {
          grouped.abandoned += 1;
        }
      });
      
      return Object.entries(grouped)
        .map(([status, count]) => ({
          status,
          count,
          fill: chartConfig[status]?.color || 'hsl(var(--chart-1))'
        }))
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count); // Sort by count descending
    }
    
    // Try to use dashboard summary data
    if (dashboard?.sessionStats) {
      // console.log('📈 Using dashboard session stats:', dashboard.sessionStats);
      
      const stats = dashboard.sessionStats;
      const completed = stats.thisWeek?.completed || stats.today?.completed || 0;
      const total = stats.thisWeek?.total || stats.today?.total || 0;
      const inProgress = Math.floor(total * 0.2); // Assume 20% in progress
      const abandoned = total - completed - inProgress;
      
      return [
        { status: 'completed', count: completed, fill: chartConfig.completed.color },
        { status: 'abandoned', count: Math.max(0, abandoned), fill: chartConfig.abandoned.color },
        { status: 'inprogress', count: inProgress, fill: chartConfig.inprogress.color }
      ].filter(item => item.count > 0);
    }

    // Fallback to generated mock data
    // console.log('🔍 No API data, using generated mock data');
    return mockChartData;
  }, [funnelAnalytics, trackingSessions, sessionsData, dashboard]);
  
  const totalSessions = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Session Funnel Analytics</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            User session completion funnel
          </span>
          <span className='@[540px]/card:hidden'>Session funnel</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[250px]'
        >
          <PieChart>
            <defs>
              {['completed', 'abandoned', 'inprogress', 'failed'].map(
                (status, index) => (
                  <linearGradient
                    key={status}
                    id={`fill${status}`}
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop
                      offset='0%'
                      stopColor={chartConfig[status]?.color || 'hsl(var(--chart-1))'}
                      stopOpacity={1 - index * 0.1}
                    />
                    <stop
                      offset='100%'
                      stopColor={chartConfig[status]?.color || 'hsl(var(--chart-1))'}
                      stopOpacity={0.8 - index * 0.1}
                    />
                  </linearGradient>
                )
              )}
            </defs>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData.map((item) => ({
                ...item,
                fill: `url(#fill${item.status})`
              }))}
              dataKey='count'
              nameKey='status'
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
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalSessions.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total Sessions
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium'>
          {(() => {
            const completedSession = chartData.find(item => item.status === 'completed');
            if (completedSession && totalSessions > 0) {
              return `completed: ${((completedSession.count / totalSessions) * 100).toFixed(1)}%`;
            }
            return chartData.length > 0 ? `${chartData[0].status}: ${((chartData[0].count / totalSessions) * 100).toFixed(1)}%` : 'No data';
          })()}{' '}
          <IconTrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          Session completion funnel analysis
        </div>
      </CardFooter>
    </Card>
  );
}
