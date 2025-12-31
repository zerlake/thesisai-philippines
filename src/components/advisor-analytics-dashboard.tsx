"use client";

import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { 
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Target,
  Calendar,
  BarChart3,
  TrendingUp,
  PieChart,
  FileSearch,
  Notebook,
  BookOpen,
  UserCheck,
  Activity,
  MessageCircle,
  Mail,
  Eye,
  Download,
  Filter
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface AdvisorAnalytics {
  total_students: number;
  avg_feedback_days: number;
  students_with_overdue_milestones: number;
  pending_reviews: number;
  completed_reviews: number;
  avg_turnaround_time: number;
  satisfaction_rating: number;
}

interface AtRiskStudent {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  overdue_milestone: string;
  days_overdue: number;
  last_contact: string;
  advisor_notes: string;
}

export function AdvisorAnalyticsDashboard() {
  const { profile, supabase } = useAuth();
  const [analytics, setAnalytics] = useState<AdvisorAnalytics | null>(null);
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("month");

  // Load advisor analytics
  useEffect(() => {
    if (!profile) return;
    
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        // Load advisor dashboard analytics
        const { data: analyticsData, error: analyticsError } = await supabase
          .rpc('get_advisor_dashboard_analytics', { p_advisor_id: profile.id });

        if (analyticsError) throw analyticsError;

        setAnalytics(analyticsData);

        // Load at-risk students
        const { data: atRiskData, error: atRiskError } = await supabase
          .rpc('get_at_risk_students_for_advisor', { p_advisor_id: profile.id });

        if (atRiskError) throw atRiskError;

        setAtRiskStudents(atRiskData || []);
      } catch (error) {
        console.error("Error loading advisor analytics:", error);
        toast.error("Failed to load advisor analytics");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [profile, supabase]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2 border rounded-lg p-1">
          <button
            className={`px-3 py-1 text-sm rounded ${timeRange === 'week' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={`px-3 py-1 text-sm rounded ${timeRange === 'month' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button
            className={`px-3 py-1 text-sm rounded ${timeRange === 'quarter' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            onClick={() => setTimeRange('quarter')}
          >
            Quarter
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_students || 0}</div>
            <p className="text-xs text-muted-foreground">Assigned to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Feedback Days</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.avg_feedback_days?.toFixed(1) || 0}</div>
            <p className="text-xs text-muted-foreground">Response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.students_with_overdue_milestones || 0}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.pending_reviews || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting feedback</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Turnaround Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Feedback Turnaround
            </CardTitle>
            <CardDescription>
              Average time to provide feedback on student submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Current Period</span>
                <span className="font-medium">{analytics?.avg_turnaround_time?.toFixed(1) || 0} days</span>
              </div>
              <Progress value={Math.min(100, analytics?.avg_turnaround_time || 0)} className="h-2" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Target: 3 days</span>
                <span>{analytics?.satisfaction_rating?.toFixed(1) || 0}/5 rating</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Student Engagement
            </CardTitle>
            <CardDescription>
              Activity levels of your assigned students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Highly Active</span>
                <span className="font-medium">12</span>
              </div>
              <Progress value={60} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Moderately Active</span>
                <span className="font-medium">8</span>
              </div>
              <Progress value={40} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Activity</span>
                <span className="font-medium">5</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            At-Risk Students
          </CardTitle>
          <CardDescription>
            Students with overdue milestones requiring immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {atRiskStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No at-risk students found.</p>
              <p className="text-sm">All your students are on track!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {atRiskStudents.map((student) => (
                <div key={student.student_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {student.first_name?.charAt(0)}
                        {student.last_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{student.first_name} {student.last_name}</div>
                      <div className="text-sm text-muted-foreground">{student.email}</div>
                      <div className="text-sm">
                        <span className="font-medium">Milestone:</span> {student.overdue_milestone}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-destructive">
                      {student.days_overdue} days overdue
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last contact: {new Date(student.last_contact).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completed Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Recent Reviews
            </CardTitle>
            <CardDescription>
              Your recently completed student reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Maria Santos</div>
                  <div className="text-sm text-muted-foreground">Chapter 3 Review</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">2 days ago</div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Juan Dela Cruz</div>
                  <div className="text-sm text-muted-foreground">Proposal Feedback</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">3 days ago</div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Ana Reyes</div>
                  <div className="text-sm text-muted-foreground">Literature Review</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">5 days ago</div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advisor Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Advisor Insights
            </CardTitle>
            <CardDescription>
              Performance metrics and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Response Time</span>
                <span className="font-medium">{analytics?.avg_feedback_days?.toFixed(1) || 0} days</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Completion Rate</span>
                <span className="font-medium">85%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Student Satisfaction</span>
                <div className="flex items-center">
                  <span className="font-medium mr-2">{analytics?.satisfaction_rating?.toFixed(1) || 0}/5</span>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(analytics?.satisfaction_rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Projects</span>
                <span className="font-medium">{analytics?.total_students || 0}</span>
              </div>
            </div>
            
            <Button className="w-full mt-4">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Star icon component for ratings
function Star({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M8 0l2.5 5.5h5.5l-4.5 3.5 1.5 5.5-4.5-3.5-4.5 3.5 1.5-5.5-4.5-3.5h5.5z" />
    </svg>
  );
}