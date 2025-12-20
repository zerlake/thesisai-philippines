'use client';

import { useEffect, useState } from "react";
import { useAuth } from "../auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import {
  Timer,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  CalendarDays,
  Inbox,
  ArrowRight,
  Star,
  FileSearch,
  ClipboardCheck
} from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DashboardPuterStatus } from "@/components/dashboard-puter-status";

type ReviewQueueItem = {
  student_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
  document_id: string;
  document_title: string | null;
  approved_at: string;
  priority?: 'high' | 'medium' | 'low';
  days_waiting?: number;
};

type CriticStats = {
  total_students: number;
  pending_reviews: number;
  completed_this_month: number;
  avg_turnaround_days: number | null;
  certification_rate: number;
  total_earnings: number;
};

type RecentActivity = {
  id: string;
  type: 'review' | 'certification' | 'feedback';
  student_name: string;
  document_title: string;
  timestamp: string;
};

export function EnhancedCriticDashboard() {
  const { session, supabase, profile } = useAuth();
  const [stats, setStats] = useState<CriticStats>({
    total_students: 0,
    pending_reviews: 0,
    completed_this_month: 0,
    avg_turnaround_days: null,
    certification_rate: 0,
    total_earnings: 0
  });
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);

      // Fetch statistics
      try {
        // Student count
        const studentCountResult = await supabase
          .from('critic_student_relationships')
          .select('*', { count: 'exact', head: true })
          .eq('critic_id', session.user.id);

        const studentCount = studentCountResult.count || 0;

        // Try to get analytics
        let avgTurnaround = null;
        try {
          const analyticsResult = await supabase.rpc('get_critic_dashboard_analytics', {
            p_critic_id: session.user.id
          });
          if (!analyticsResult.error && analyticsResult.data) {
            avgTurnaround = analyticsResult.data.avg_turnaround_days;
          }
        } catch {
          console.warn("Analytics function not available");
        }

        // Fetch pending reviews
        const pendingResult = await supabase
          .from('thesis_documents')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        setStats(prev => ({
          ...prev,
          total_students: studentCount,
          pending_reviews: pendingResult.count || 0,
          avg_turnaround_days: avgTurnaround,
          completed_this_month: 12, // Placeholder
          certification_rate: 94, // Placeholder
          total_earnings: 15000 // Placeholder
        }));

      } catch (error) {
        console.error("Error fetching stats:", error);
      }

      // Fetch review queue
      try {
        const { data, error } = await supabase.rpc('get_students_for_critic_review', {
          p_critic_id: session.user.id
        });

        if (error) {
          // Fallback query
          const fallbackResult = await supabase
            .from('thesis_documents')
            .select(`
              id as document_id,
              title as document_title,
              created_at as approved_at,
              user_id as student_id
            `)
            .eq('status', 'approved')
            .limit(5);

          if (!fallbackResult.error && fallbackResult.data) {
            const queueWithPriority = fallbackResult.data.map((item, idx) => ({
              ...item,
              first_name: 'Student',
              last_name: `${idx + 1}`,
              priority: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low',
              days_waiting: Math.floor(Math.random() * 7) + 1
            })) as ReviewQueueItem[];
            setReviewQueue(queueWithPriority);
          }
        } else {
          const queueWithPriority = (data || []).map((item: ReviewQueueItem, idx: number) => ({
            ...item,
            priority: idx === 0 ? 'high' : idx === 1 ? 'medium' : 'low',
            days_waiting: Math.floor(Math.random() * 7) + 1
          }));
          setReviewQueue(queueWithPriority);
        }
      } catch (error) {
        console.error("Error fetching review queue:", error);
        setReviewQueue([]);
      }

      // Set recent activity (placeholder data)
      setRecentActivity([
        {
          id: '1',
          type: 'certification',
          student_name: 'Maria Santos',
          document_title: 'AI in Philippine Education',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'feedback',
          student_name: 'Juan Dela Cruz',
          document_title: 'Sustainable Tourism Framework',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'review',
          student_name: 'Ana Reyes',
          document_title: 'Digital Marketing Strategies',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

      setIsLoading(false);
    };

    fetchDashboardData();
  }, [session, supabase]);

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Medium</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'certification':
        return <Award className="h-4 w-4 text-green-500" />;
      case 'feedback':
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <FileSearch className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Critic Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.first_name || 'Critic'}. You have {stats.pending_reviews} manuscripts awaiting review.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DashboardPuterStatus />
          <Link href="/critic/review-queue">
            <Button>
              <Inbox className="mr-2 h-4 w-4" />
              Review Queue
            </Button>
          </Link>
          <Link href="/critic/deadlines">
            <Button variant="outline">
              <CalendarDays className="mr-2 h-4 w-4" />
              Deadlines
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.total_students}</div>
                <p className="text-xs text-muted-foreground">Assigned to you</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-yellow-500">{stats.pending_reviews}</div>
                <p className="text-xs text-muted-foreground">Awaiting your review</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Turnaround</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.avg_turnaround_days?.toFixed(1) || 'N/A'} <span className="text-sm font-normal">days</span>
                </div>
                <p className="text-xs text-muted-foreground">Certification time</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-500">{stats.completed_this_month}</div>
                <p className="text-xs text-muted-foreground">Certifications completed</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Review Queue - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Inbox className="h-5 w-5" />
                  Priority Review Queue
                </CardTitle>
                <CardDescription>Manuscripts ready for your review and certification</CardDescription>
              </div>
              <Link href="/critic/review-queue">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Waiting</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 float-right" /></TableCell>
                    </TableRow>
                  ))
                ) : reviewQueue.length > 0 ? (
                  reviewQueue.slice(0, 5).map((item) => (
                    <TableRow key={item.document_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.avatar_url || undefined} />
                            <AvatarFallback>
                              {item.first_name?.charAt(0)}{item.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{item.first_name} {item.last_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {item.document_title || "Untitled Document"}
                      </TableCell>
                      <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                      <TableCell>
                        <span className={item.days_waiting && item.days_waiting > 3 ? 'text-red-500' : ''}>
                          {item.days_waiting} days
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/drafts/${item.document_id}`}>
                          <Button size="sm">Review</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="mx-auto h-8 w-8 mb-2 text-green-500" />
                      Your review queue is empty. Great work!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link href="/critic/manuscript-analyzer">
                <Button variant="outline" className="w-full justify-start">
                  <FileSearch className="mr-2 h-4 w-4" />
                  Analyze Manuscript
                </Button>
              </Link>
              <Link href="/critic/feedback-templates">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Feedback Templates
                </Button>
              </Link>
              <Link href="/critic/certification-checklist">
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Certification Checklist
                </Button>
              </Link>
              <Link href="/critic/issue-certificate">
                <Button variant="outline" className="w-full justify-start">
                  <Award className="mr-2 h-4 w-4" />
                  Issue Certificate
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.document_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.type === 'certification' ? 'Certified' :
                         activity.type === 'feedback' ? 'Sent feedback to' : 'Reviewed'} {activity.student_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isMounted && formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Certification Rate</span>
                  <span className="text-sm font-medium">{stats.certification_rate}%</span>
                </div>
                <Progress value={stats.certification_rate} className="h-2" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Monthly Earnings</span>
                <span className="font-medium text-green-500">₱{stats.total_earnings.toLocaleString()}</span>
              </div>
              <Link href="/critic/statistics">
                <Button variant="ghost" size="sm" className="w-full">
                  View Full Statistics <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Getting Started Section for New Critics */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Getting Started as a Critic</CardTitle>
          <CardDescription>Quick guide to help you navigate your critic workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                1
              </div>
              <div>
                <h4 className="font-medium">Check Your Queue</h4>
                <p className="text-sm text-muted-foreground">
                  Review manuscripts that have been approved by advisors and are awaiting your certification.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                2
              </div>
              <div>
                <h4 className="font-medium">Use Review Tools</h4>
                <p className="text-sm text-muted-foreground">
                  Analyze manuscripts for grammar, citations, plagiarism, and format compliance.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                3
              </div>
              <div>
                <h4 className="font-medium">Certify or Request Revisions</h4>
                <p className="text-sm text-muted-foreground">
                  Provide feedback using templates and either certify the thesis or request revisions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
