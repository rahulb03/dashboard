'use client';

import * as React from 'react';
import { useSelector } from 'react-redux';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

export const description = 'An interactive bar chart';

// Generate dynamic 30-day mock data for better visualization
const generateLast30DaysData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate realistic session data with weekly patterns
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseCompleted = isWeekend ? 30 : 80;
    const basePending = isWeekend ? 10 : 25;
    const baseAbandoned = isWeekend ? 5 : 15;
    
    data.push({
      date: dateStr,
      completed: Math.floor(baseCompleted + Math.random() * 40),
      pending: Math.floor(basePending + Math.random() * 15),
      abandoned: Math.floor(baseAbandoned + Math.random() * 10)
    });
  }
  
  return data;
};

// Fallback mock data for when no tracking data is available
const mockChartData = generateLast30DaysData();


const chartConfig = {
  views: {
    label: 'Sessions'
  },
  completed: {
    label: 'Completed',
    color: 'hsl(var(--chart-1))'
  },
  pending: {
    label: 'In Progress',
    color: 'hsl(var(--chart-2))'
  },
  abandoned: {
    label: 'Abandoned',
    color: 'hsl(var(--chart-3))'
  },
  error: {
    label: 'Error',
    color: 'var(--primary)'
  }
};

export function BarGraph() {
  const [activeChart, setActiveChart] = React.useState('completed');
  const { 
    sessions: trackingSessions, 
    sessionsData, 
    trends,
    dashboard,
    loading 
  } = useSelector((state) => state.tracking);

  // Build chart data: group sessions by day and completion status
  const chartData = React.useMemo(() => {
    console.log('🔍 BarGraph - Redux State Debug:');
    console.log('trackingSessions:', trackingSessions?.length || 0);
    console.log('sessionsData:', sessionsData);
    console.log('trends:', trends);
    console.log('dashboard:', dashboard);
    
    // Try to use session data from API first
    const apiSessions = sessionsData?.data || trackingSessions;
    
    if (Array.isArray(apiSessions) && apiSessions.length > 0) {
      console.log('📊 Using API session data:', apiSessions.length, 'sessions');
      
      // Group by date (YYYY-MM-DD)
      const grouped = {};
      apiSessions.forEach((session) => {
        const d = new Date(session.startedAt || session.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (!grouped[key]) grouped[key] = { date: key, completed: 0, pending: 0, abandoned: 0 };

        if (session.isCompleted) {
          grouped[key].completed += 1;
        } else if (session.currentStep && session.currentStep !== 'start') {
          grouped[key].pending += 1;
        } else {
          grouped[key].abandoned += 1;
        }
      });

      // Sort by date and get last 30 entries
      const rows = Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
      const last30Days = rows.slice(-30);
      
      // If we don't have enough days, fill with empty days
      if (last30Days.length < 30) {
        const filledData = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const existingData = last30Days.find(d => d.date === dateStr);
          if (existingData) {
            filledData.push(existingData);
          } else {
            filledData.push({ date: dateStr, completed: 0, pending: 0, abandoned: 0 });
          }
        }
        
        return filledData;
      }
      
      return last30Days;
    }
    
    // Fallback to generated data when no API data available
    console.log('🔍 No API session data, generating fallback data');
    const freshData = generateLast30DaysData();
    console.log('📊 Using generated 30-day data:', freshData.length, 'entries');
    return freshData;
  }, [trackingSessions, sessionsData, trends, dashboard]);

  const total = React.useMemo(() => ({
    completed: chartData.reduce((acc, curr) => acc + (curr.completed || 0), 0),
    pending: chartData.reduce((acc, curr) => acc + (curr.pending || 0), 0),
    abandoned: chartData.reduce((acc, curr) => acc + (curr.abandoned || 0), 0)
  }), [chartData]);
  

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (activeChart === 'error') {
      throw new Error('Mocking Error');
    }
  }, [activeChart]);

  if (!isClient) {
    return null;
  }

  return (
    <Card className='@container/card !pt-3'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 !py-0'>
          <CardTitle>Session Analytics Trends</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>
              Daily session completion trends for the last 30 days
            </span>
            <span className='@[540px]/card:hidden'>Last 30 days</span>
          </CardDescription>
        </div>
        <div className='flex'>
          {['completed', 'pending', 'abandoned'].map((key) => {
            const chart = key;
            // Always show all categories, even if count is 0
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className='data-[active=true]:bg-primary/5 hover:bg-primary/5 relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left transition-colors duration-200 even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
                onClick={() => setActiveChart(chart)}
              >
                <span className='text-muted-foreground text-xs'>
                  {chartConfig[chart].label}
                </span>
                <span className='text-lg leading-none font-bold sm:text-3xl'>
                  {total[key]?.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <defs>
              <linearGradient id='fillBar' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='0%'
                  stopColor='var(--primary)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='100%'
                  stopColor='var(--primary)'
                  stopOpacity={0.2}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                });
              }}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey='views'
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }}
                />
              }
            />
            <Bar
              dataKey={activeChart}
              fill='url(#fillBar)'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
