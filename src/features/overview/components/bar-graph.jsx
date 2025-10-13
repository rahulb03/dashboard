'use client';

import * as React from 'react';
import { useSelector } from 'react-redux';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [dateRange, setDateRange] = React.useState('30'); // '7', '14', '30', 'all'
  const [groupBy, setGroupBy] = React.useState('day'); // 'day' or 'week'
  
  const { 
    sessions: trackingSessions, 
    sessionsData, 
    trends,
    dashboard,
    loading 
  } = useSelector((state) => state.tracking);

  // Helper function to get week range string
  const getWeekRange = (startDate) => {
    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(end.getDate() + 6);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };
  
  // Helper function to get week start date
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Get Monday
    const weekStart = new Date(d.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  };

  // Build chart data: group sessions by day or week and completion status
  const chartData = React.useMemo(() => {
    // console.log('\n========================================');
    // console.log('🔍 BarGraph - RECALCULATING CHART DATA');
    // console.log('========================================');
    // console.log('State:', { dateRange, groupBy });
    // console.log('trackingSessions:', trackingSessions?.length || 0);
    
    // Try to use session data from API first
    const apiSessions = sessionsData?.data || trackingSessions;
    
    if (Array.isArray(apiSessions) && apiSessions.length > 0) {
      // console.log('📊 Using API session data:', apiSessions.length, 'sessions');
      
      // Filter by date range first
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today for accurate comparison
      
      const filteredSessions = dateRange === 'all' ? apiSessions : apiSessions.filter(session => {
        const sessionDate = new Date(session.startedAt || session.createdAt);
        sessionDate.setHours(0, 0, 0, 0); // Normalize to start of day
        
        // Calculate cutoff date
        const cutoffDate = new Date(today);
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange));
        cutoffDate.setHours(0, 0, 0, 0);
        
        // Session should be on or after cutoff date
        return sessionDate >= cutoffDate;
      });
      
      // console.log('📊 Date Range Filter:');
      // console.log('  - Selected range:', dateRange === 'all' ? 'All time' : `Last ${dateRange} days`);
      // console.log('  - Total sessions:', apiSessions.length);
      // console.log('  - Filtered sessions:', filteredSessions.length);
      if (dateRange !== 'all' && filteredSessions.length > 0) {
        const dates = filteredSessions.map(s => new Date(s.startedAt || s.createdAt));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        // console.log('  - Date range in data:', minDate.toLocaleDateString(), 'to', maxDate.toLocaleDateString());
      }
      
      // Group by date or week
      const grouped = {};
      filteredSessions.forEach((session) => {
        const d = new Date(session.startedAt || session.createdAt);
        let key;
        
        if (groupBy === 'week') {
          // Group by week (Monday as start)
          key = getWeekStart(d);
        } else {
          // Group by day
          key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        
        if (!grouped[key]) {
          grouped[key] = { 
            date: key, 
            dateLabel: groupBy === 'week' ? getWeekRange(key) : key,
            completed: 0, 
            pending: 0, 
            abandoned: 0 
          };
        }

        if (session.isCompleted) {
          grouped[key].completed += 1;
        } else if (session.currentStep && session.currentStep !== 'start') {
          grouped[key].pending += 1;
        } else {
          grouped[key].abandoned += 1;
        }
      });

      // Sort by date and return ALL data (no limit)
      const rows = Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // console.log('📊 Final chart data:', rows.length, 'entries');
      return rows;
    }
    
    // Fallback to generated data when no API data available
    // console.log('🔍 No API session data, generating fallback data');
    let freshData = generateLast30DaysData();
    
    // Apply date range filter to fallback data too
    if (dateRange !== 'all' && dateRange !== '30') {
      const daysToShow = parseInt(dateRange);
      freshData = freshData.slice(-daysToShow); // Get last N days
    }
    
    // console.log('📊 Using generated fallback data:', freshData.length, 'entries for', dateRange === 'all' ? 'all time' : `${dateRange} days`);
    return freshData.map(d => ({ ...d, dateLabel: d.date }));
  }, [trackingSessions, sessionsData, dateRange, groupBy]);

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
          <div className='flex items-center gap-2'>
            <CardTitle>Session Analytics Trends</CardTitle>
            <Badge variant='outline' className='text-xs'>
              {dateRange === 'all' ? 'All time' : `${dateRange}d`} | {groupBy === 'week' ? 'Week' : 'Day'} | {chartData.length} pts
            </Badge>
          </div>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>
              {groupBy === 'week' ? 'Weekly' : 'Daily'} session trends - {dateRange === 'all' ? 'All time' : `Last ${dateRange} days`} ({chartData.length} {groupBy === 'week' ? 'weeks' : 'days'})
            </span>
            <span className='@[540px]/card:hidden'>
              {dateRange === 'all' ? 'All' : dateRange + 'd'} ({chartData.length})
            </span>
          </CardDescription>
          <div className='flex gap-2 mt-2'>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">By Day</SelectItem>
                <SelectItem value="week">By Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            key={`${dateRange}-${groupBy}`}
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
                if (groupBy === 'week') {
                  // Show week range for weekly view
                  return getWeekRange(value).split(' - ')[0]; // Show start date only
                }
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
                  className='w-[200px]'
                  nameKey='views'
                  labelFormatter={(value) => {
                    if (groupBy === 'week') {
                      return getWeekRange(value);
                    }
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
