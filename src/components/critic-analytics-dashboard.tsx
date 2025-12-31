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
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
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
  Filter,
  EyeOff,
  Award,
  Scale
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface CriticAnalytics {
  total_students: number;
  pending_reviews: number;
  completed_reviews: number;
  avg_turnaround_time: number;
  certification_rate: number;
  satisfaction_rating: number;
  total_certifications: number;
}

interface StudentForReview {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  document_title: string;
  document_type: string;
  submitted_at: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  advisor_name: string;
  department: string;
}

export function CriticAnalyticsDashboard() {
  const { profile, supabase } = useAuth();
  const [analytics, setAnalytics] = useState<CriticAnalytics | null>(null);
  const [studentsForReview, setStudentsForReview] = useState<StudentForReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("month");

  // Load critic analytics
  useEffect(() => {
    if (!profile) return;
    
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        // Load critic dashboard analytics
        const { data: analyticsData, error: analyticsError } = await supabase
          .rpc('get_critic_dashboard_analytics', { p_critic_id: profile.id });

        if (analyticsError) throw analyticsError;

        setAnalytics(analyticsData);

        // Load students for critic review
        const { data: studentsData, error: studentsError } = await supabase
          .rpc('get_students_for_critic_review', { p_critic_id: profile.id });

        if (studentsError) throw studentsError;

        setStudentsForReview(studentsData || []);
      } catch (error) {
        console.error("Error loading critic analytics:", error);
        toast.error("Failed to load critic analytics");
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

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100"><AlertTriangle className="w-3 h-3 mr-1" /> Critical</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800 hover:bg-orange-100"><AlertTriangle className="w-3 h-3 mr-1" /> High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertTriangle className="w-3 h-3 mr-1" /> Medium</Badge>;
      case 'low':
        return <Badge variant="secondary"><CheckCircle className="w-3 h-3 mr-1" /> Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

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
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.pending_reviews || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Turnaround</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.avg_turnaround_time?.toFixed(1) || 0}d</div>
            <p className="text-xs text-muted-foreground">Review time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certification Rate</CardTitle>
            <Award className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.certification_rate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">Successful certifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Turnaround Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Review Turnaround
            </CardTitle>
            <CardDescription>
              Average time to complete document reviews
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
                <span>Target: 5 days</span>
                <span>{analytics?.satisfaction_rating?.toFixed(1) || 0}/5 rating</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certification Success Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Certification Success
            </CardTitle>
            <CardDescription>
              Success rate of document certifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Certified</span>
                <span className="font-medium">{analytics?.total_certifications || 0}</span>
              </div>
              <Progress value={analytics?.certification_rate || 0} className="h-2" />
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Requires Revision</span>
                <span className="font-medium">{(analytics?.total_students || 0) - (analytics?.total_certifications || 0)}</span>
              </div>
              <Progress value={100 - (analytics?.certification_rate || 0)} className="h-2" />
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Total Reviews: {analytics?.pending_reviews + analytics?.completed_reviews || 0}</span>
                <span>Success Rate: {analytics?.certification_rate?.toFixed(1) || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Ready for Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="w-5 h-5" />
            Students Ready for Review
          </CardTitle>
          <CardDescription>
            Students with documents ready for your review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {studentsForReview.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No students with documents ready for review.</p>
              <p className="text-sm">All documents have been reviewed or are pending.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {studentsForReview.map((student) => (
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
                        <span className="font-medium">Document:</span> {student.document_title}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-muted-foreground">{student.document_type}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(student.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    {getPriorityBadge(student.priority)}
                    <div className="text-xs text-muted-foreground mt-1">{student.department}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Contact
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
              Your recently completed document reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Maria Santos</div>
                  <div className="text-sm text-muted-foreground">Thesis Defense Doc</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">1 day ago</div>
                  <Badge variant="secondary">Certified</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Juan Dela Cruz</div>
                  <div className="text-sm text-muted-foreground">Research Paper</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">2 days ago</div>
                  <Badge variant="destructive">Revision Req.</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Ana Reyes</div>
                  <div className="text-sm text-muted-foreground">Dissertation</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">3 days ago</div>
                  <Badge variant="secondary">Certified</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critic Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Critic Performance
            </CardTitle>
            <CardDescription>
              Your review performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Turnaround Time</span>
                <span className="font-medium">{analytics?.avg_turnaround_time?.toFixed(1) || 0} days</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Certification Rate</span>
                <span className="font-medium">{analytics?.certification_rate?.toFixed(1) || 0}%</span>
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
                <span className="text-sm">Total Certifications</span>
                <span className="font-medium">{analytics?.total_certifications || 0}</span>
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