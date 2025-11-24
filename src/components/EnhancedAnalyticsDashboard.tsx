'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  TrendingUp, 
  Target, 
  Activity,
  Flame,
  CalendarCheck,
  BookOpen
} from 'lucide-react';
import { AnalyticsCalculator } from '@/lib/analyticsCalculator';
import { useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Bar, 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  Line,
  LineChart
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from '@/components/ui/chart';

interface DateRange {
  start: Date;
  end: Date;
}

export function EnhancedAnalyticsDashboard() {
  const { session } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [productivityPattern, setProductivityPattern] = useState<any>(null);
  const [dailyStats, setDailyStats] = useState<any[]>([]);

  const calculator = useMemo(() => new AnalyticsCalculator(), []);

  useEffect(() => {
    if (!session?.user.id) return;

    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        // Calculate analytics
        const analyticsData = await calculator.calculateAnalytics(
          session.user.id,
          dateRange
        );

        setAnalytics(analyticsData);

        // Calculate productivity patterns
        const pattern = await calculator.calculateProductivityPatterns(
          session.user.id,
          dateRange
        );
        setProductivityPattern(pattern);

        // Calculate daily stats
        const stats = await calculator.calculateDailyStats(
          session.user.id,
          dateRange
        );
        setDailyStats(stats);

      } catch (error) {
        console.error('Error loading analytics:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [session?.user.id, dateRange, calculator]);

  // Update date range based on time range selection
  useEffect(() => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    setDateRange({ start: startDate, end: endDate });
  }, [timeRange]);

  // Format day of week for heatmap
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hourRange = Array.from({ length: 24 }, (_, i) => i);

  // Get heatmap data for chart
  const heatmapData = analytics?.heatmapData 
    ? Array.from({ length: 7 }, (_, dayIndex) => {
        const dayData = analytics.heatmapData.filter((d: any) => d.day === dayIndex);
        const hourToData: any = {};
        dayData.forEach((d: any) => {
          hourToData[d.hour] = d;
        });

        return {
          day: dayNames[dayIndex],
          ...Object.fromEntries(
            Array.from({ length: 24 }, (_, hour) => [
              `h${hour}`,
              hourToData[hour] ? hourToData[hour].wordsWritten : 0
            ])
          )
        };
      })
    : [];

  // Get velocity data for chart
  const velocityChartData = analytics?.velocityData || [];

  // Get daily stats for writing activity chart
  const activityChartData = dailyStats.map((stat: any) => ({
    date: format(new Date(stat.date), 'MMM dd'),
    words: stat.wordsWritten,
    sessions: stat.sessionsCount
  }));



  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Writing Analytics</h1>
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map(range => (
                <Badge key={range} variant="outline" className="px-3 py-1">
                  {range}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                    <div className="p-2 bg-primary/10 rounded-md">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Loading Chart...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Loading Chart...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Loading Chart...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LineChart className="w-8 h-8 text-primary" />
          Writing Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualize your writing progress and productivity patterns
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm ${
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-sm font-medium">Total Words</CardTitle>
              <div className="p-2 bg-primary/10 rounded-md">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.wordCountMetrics?.total?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">words written</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-sm font-medium">Avg. Daily</CardTitle>
              <div className="p-2 bg-primary/10 rounded-md">
                <Target className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.wordCountMetrics?.average?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">words per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-sm font-medium">Writing Streak</CardTitle>
              <div className="p-2 bg-primary/10 rounded-md">
                <Flame className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productivityPattern?.writingStreak || 0}</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-sm font-medium">Predicted Finish</CardTitle>
              <div className="p-2 bg-primary/10 rounded-md">
                <CalendarCheck className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.predictions?.estimatedCompletionDate 
                ? format(new Date(analytics.predictions.estimatedCompletionDate), 'MMM d') 
                : 'N/A'}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className={analytics?.predictions?.confidence ? '' : 'text-muted-foreground'}>
                {analytics?.predictions?.confidence ? `${analytics.predictions.confidence}% confidence` : 'Insufficient data'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Word Count Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Writing Velocity
            </CardTitle>
            <CardDescription>Words written over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={velocityChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return format(date, 'MMM dd');
                    }}
                  />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />} 
                    formatter={(value, name) => {
                      if (name === 'wordsWritten') return ['Words Written', value, 'Words'];
                      if (name === 'cumulativeWords') return ['Cumulative Words', value, 'Total'];
                      return [name, value];
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="wordsWritten" 
                    stroke="var(--color-primary)" 
                    fill="var(--color-primary)" 
                    fillOpacity={0.2} 
                    name="Daily Words"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulativeWords" 
                    stroke="var(--color-secondary)" 
                    strokeWidth={2} 
                    name="Cumulative Total"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Writing Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Daily Activity
            </CardTitle>
            <CardDescription>Words and sessions per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="words" fill="var(--color-primary)" name="Words" />
                  <Bar dataKey="sessions" fill="var(--color-secondary)" name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Productivity Heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Writing Heatmap
            </CardTitle>
            <CardDescription>Your writing activity by day and hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Hour labels */}
                <div className="flex ml-20 mb-2">
                  {hourRange.map(hour => (
                    <div key={hour} className="w-8 text-center text-xs text-muted-foreground">
                      {hour}
                    </div>
                  ))}
                </div>
                
                {/* Heatmap grid */}
                {heatmapData.map((dayData: any, dayIndex: number) => (
                  <div key={dayIndex} className="flex items-center mb-1">
                    <div className="w-16 text-xs text-muted-foreground">
                      {dayData.day}
                    </div>
                    {hourRange.map((hour: number) => {
                      const value = dayData[`h${hour}`] || 0;
                      // Determine color intensity based on value
                      let bgColor = 'bg-gray-100';
                      if (value > 0) {
                        if (value > 100) bgColor = 'bg-green-500';
                        else if (value > 50) bgColor = 'bg-green-400';
                        else if (value > 20) bgColor = 'bg-green-300';
                        else bgColor = 'bg-green-200';
                      }
                      
                      return (
                        <div 
                          key={hour} 
                          className={`w-8 h-8 border ${bgColor} rounded-sm`}
                          title={`${dayData.day} ${hour}:00 - ${value} words`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Productivity Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Your Patterns
            </CardTitle>
            <CardDescription>Identified productivity patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Most Productive Day</span>
                <Badge variant="secondary">
                  {dayNames[productivityPattern?.mostProductiveDay] || 'N/A'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Most Productive Hour</span>
                <Badge variant="secondary">
                  {productivityPattern?.mostProductiveHour !== undefined ? `${productivityPattern.mostProductiveHour}:00` : 'N/A'} 
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Avg. Words/Session</span>
                <span className="font-medium">
                  {productivityPattern?.averageWordsPerSession?.toLocaleString() || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Avg. Words/Minute</span>
                <span className="font-medium">
                  {productivityPattern?.averageWordsPerMinute?.toFixed(2) || 0}
                </span>
              </div>
              
              <div className="pt-4">
                <h4 className="font-medium mb-2">Chapter Progress</h4>
                <div className="space-y-2">
                  {analytics?.chapterProgress?.slice(0, 3).map((chapter: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate max-w-[120px]">{chapter.title}</span>
                        <span>{chapter.percentComplete}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${chapter.percentComplete}%` }}
                        ></div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">No chapter data</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}