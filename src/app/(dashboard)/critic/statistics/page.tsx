'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { redirect } from "next/navigation";
import { BrandedLoader } from "@/components/branded-loader";
import {
  BarChart,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Users,
  FileText,
  Award,
  Calendar,
  Star,
  Target,
  Zap
} from "lucide-react";

type StatisticsData = {
  overview: {
    total_reviews: number;
    total_certifications: number;
    total_revisions_requested: number;
    avg_turnaround_hours: number;
    certification_rate: number;
    student_satisfaction: number;
  };
  monthly: {
    month: string;
    reviews: number;
    certifications: number;
    revisions: number;
  }[];
  by_category: {
    category: string;
    count: number;
    percentage: number;
  }[];
  performance_metrics: {
    metric: string;
    value: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
  }[];
};

export default function StatisticsPage() {
  const authContext = useAuth();
  const [timeRange, setTimeRange] = useState("6months");
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        overview: {
          total_reviews: 156,
          total_certifications: 142,
          total_revisions_requested: 89,
          avg_turnaround_hours: 48,
          certification_rate: 91,
          student_satisfaction: 4.7,
        },
        monthly: [
          { month: 'Jul', reviews: 24, certifications: 22, revisions: 12 },
          { month: 'Aug', reviews: 28, certifications: 26, revisions: 15 },
          { month: 'Sep', reviews: 32, certifications: 30, revisions: 18 },
          { month: 'Oct', reviews: 26, certifications: 24, revisions: 14 },
          { month: 'Nov', reviews: 22, certifications: 20, revisions: 16 },
          { month: 'Dec', reviews: 24, certifications: 20, revisions: 14 },
        ],
        by_category: [
          { category: 'Information Technology', count: 45, percentage: 29 },
          { category: 'Business Administration', count: 38, percentage: 24 },
          { category: 'Education', count: 32, percentage: 21 },
          { category: 'Engineering', count: 25, percentage: 16 },
          { category: 'Other', count: 16, percentage: 10 },
        ],
        performance_metrics: [
          { metric: 'Response Time', value: 48, target: 72, trend: 'up' },
          { metric: 'First-Pass Rate', value: 78, target: 75, trend: 'up' },
          { metric: 'Student Satisfaction', value: 94, target: 90, trend: 'stable' },
          { metric: 'Revision Turnaround', value: 24, target: 48, trend: 'up' },
        ],
      });
      setIsLoading(false);
    }, 1000);
  }, [timeRange]);

  if (!authContext) {
    return <BrandedLoader />;
  }

  const { session, profile, isLoading: authLoading } = authContext;

  if (!authLoading && (!session || profile?.role !== 'critic')) {
    redirect('/login');
  }

  if (authLoading || isLoading) {
    return <BrandedLoader />;
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <span className="h-4 w-4 text-yellow-500">→</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart className="h-8 w-8" />
            Review Statistics
          </h1>
          <p className="text-muted-foreground">
            Track your review performance and analytics
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.total_reviews}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certifications</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats?.overview.total_certifications}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview.certification_rate}% certification rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Turnaround</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.avg_turnaround_hours}h</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              Below 72h target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {stats?.overview.student_satisfaction}
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground">Based on student feedback</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Activity</CardTitle>
            <CardDescription>Reviews, certifications, and revision requests over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.monthly.map((month) => (
                <div key={month.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium w-12">{month.month}</span>
                    <div className="flex-1 mx-4 flex gap-1">
                      <div
                        className="h-6 bg-blue-500 rounded-l"
                        style={{ width: `${(month.reviews / 35) * 100}%` }}
                        title={`${month.reviews} reviews`}
                      />
                      <div
                        className="h-6 bg-green-500"
                        style={{ width: `${(month.certifications / 35) * 100}%` }}
                        title={`${month.certifications} certifications`}
                      />
                      <div
                        className="h-6 bg-yellow-500 rounded-r"
                        style={{ width: `${(month.revisions / 35) * 100}%` }}
                        title={`${month.revisions} revisions`}
                      />
                    </div>
                    <span className="text-muted-foreground w-20 text-right">{month.reviews} total</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-xs text-muted-foreground">Reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-xs text-muted-foreground">Certifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded" />
                  <span className="text-xs text-muted-foreground">Revisions</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance vs Targets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {stats?.performance_metrics.map((metric) => (
              <div key={metric.metric} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.metric}</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(metric.trend)}
                    <Badge variant={metric.value >= metric.target ? 'default' : 'secondary'}>
                      {metric.value >= metric.target ? 'On Target' : 'Improving'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={(metric.value / metric.target) * 100}
                    className="h-2"
                  />
                  <span className="text-xs text-muted-foreground w-16">
                    {metric.value}/{metric.target}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Reviews by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews by Field of Study</CardTitle>
          <CardDescription>Distribution of manuscripts reviewed across academic disciplines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {stats?.by_category.map((category) => (
              <div key={category.category} className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{category.count}</div>
                <div className="text-sm font-medium mt-1">{category.category}</div>
                <div className="text-xs text-muted-foreground">{category.percentage}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>Recognition for your review excellence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-medium">Speed Reviewer</p>
                <p className="text-xs text-muted-foreground">100+ reviews under 48 hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30">
              <Star className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">Top Rated</p>
                <p className="text-xs text-muted-foreground">4.5+ average satisfaction</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">Consistency Champion</p>
                <p className="text-xs text-muted-foreground">90%+ certification rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
