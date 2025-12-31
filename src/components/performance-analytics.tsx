"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  CheckCircle,
  Target,
  Activity,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  BookOpen,
  UserCheck,
  Eye,
  Download,
  Filter,
  Search,
  Settings,
  User,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Scatter,
  ScatterChart,
  FunnelChart,
  Funnel,
  Treemap
} from "recharts";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Student {
  id: string;
  name: string;
  email: string;
  thesisTitle: string;
  department: string;
  status: "on-track" | "at-risk" | "needs-attention" | "completed";
  progress: number;
  lastActive: string;
  nextMilestone: string;
  advisorNotes: string;
  pendingFeedback: boolean;
  advisorFeedbackCount: number;
  studentResponseTime: number; // in hours
  documentSubmissionRate: number; // per week
  activityScore: number; // 0-100
  riskLevel: "low" | "medium" | "high";
  phase: "proposal" | "research" | "writing" | "defense";
  enrollmentDate: string;
  expectedGraduation: string;
  advisorId: string;
  advisorName: string;
}

interface AnalyticsData {
  totalStudents: number;
  onTrackStudents: number;
  atRiskStudents: number;
  completedStudents: number;
  pendingReviews: number;
  averageProgress: number;
  averageActivityScore: number;
  highRiskStudents: number;
  weeklySubmissions: { date: string; count: number }[];
  studentPhaseDistribution: { name: string; value: number }[];
  departmentDistribution: { name: string; value: number }[];
  advisorPerformance: {
    responseTime: number; // in hours
    feedbackQuality: number; // 1-5 rating
    studentSatisfaction: number; // 1-5 rating
  };
}

const PerformanceAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalStudents: 0,
    onTrackStudents: 0,
    atRiskStudents: 0,
    completedStudents: 0,
    pendingReviews: 0,
    averageProgress: 0,
    averageActivityScore: 0,
    highRiskStudents: 0,
    weeklySubmissions: [],
    studentPhaseDistribution: [],
    departmentDistribution: [],
    advisorPerformance: {
      responseTime: 0,
      feedbackQuality: 0,
      studentSatisfaction: 0
    }
  });
  
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<string>("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    // Simulate API call to fetch analytics data
    setTimeout(() => {
      const mockStudents: Student[] = [
        {
          id: "1",
          name: "Maria Santos",
          email: "maria.santos@up.edu.ph",
          thesisTitle: "Impact of Social Media on Academic Performance",
          department: "Computer Science",
          status: "on-track",
          progress: 78,
          lastActive: "2024-12-22",
          nextMilestone: "Chapter 3 Draft",
          advisorNotes: "Good progress on methodology section",
          pendingFeedback: false,
          advisorFeedbackCount: 12,
          studentResponseTime: 4.2,
          documentSubmissionRate: 2.3,
          activityScore: 85,
          riskLevel: "low",
          phase: "writing",
          enrollmentDate: "2023-09-01",
          expectedGraduation: "2025-05-01",
          advisorId: "advisor-1",
          advisorName: "Dr. Juan Dela Cruz"
        },
        {
          id: "2",
          name: "Juan Dela Cruz",
          email: "juan.dc@up.edu.ph",
          thesisTitle: "Economic Impacts of Climate Change in Rural Philippines",
          department: "Economics",
          status: "at-risk",
          progress: 45,
          lastActive: "2024-12-18",
          nextMilestone: "Literature Review",
          advisorNotes: "Needs to improve research methodology",
          pendingFeedback: true,
          advisorFeedbackCount: 5,
          studentResponseTime: 24.5,
          documentSubmissionRate: 0.8,
          activityScore: 35,
          riskLevel: "high",
          phase: "research",
          enrollmentDate: "2023-09-01",
          expectedGraduation: "2025-05-01",
          advisorId: "advisor-1",
          advisorName: "Dr. Juan Dela Cruz"
        },
        {
          id: "3",
          name: "Ana Reyes",
          email: "ana.reyes@up.edu.ph",
          thesisTitle: "Digital Transformation in Philippine Banking",
          department: "Business Administration",
          status: "needs-attention",
          progress: 62,
          lastActive: "2024-12-20",
          nextMilestone: "Methodology Approval",
          advisorNotes: "Awaiting revisions on literature review",
          pendingFeedback: true,
          advisorFeedbackCount: 8,
          studentResponseTime: 12.3,
          documentSubmissionRate: 1.5,
          activityScore: 58,
          riskLevel: "medium",
          phase: "writing",
          enrollmentDate: "2023-09-01",
          expectedGraduation: "2025-05-01",
          advisorId: "advisor-1",
          advisorName: "Dr. Juan Dela Cruz"
        },
        {
          id: "4",
          name: "Carlos Gomez",
          email: "carlos.gomez@up.edu.ph",
          thesisTitle: "Sustainable Agriculture Practices in Mindanao",
          department: "Agricultural Sciences",
          status: "on-track",
          progress: 89,
          lastActive: "2024-12-22",
          nextMilestone: "Final Defense",
          advisorNotes: "Excellent progress, ready for defense",
          pendingFeedback: false,
          advisorFeedbackCount: 18,
          studentResponseTime: 2.1,
          documentSubmissionRate: 3.1,
          activityScore: 92,
          riskLevel: "low",
          phase: "defense",
          enrollmentDate: "2023-09-01",
          expectedGraduation: "2025-03-01",
          advisorId: "advisor-1",
          advisorName: "Dr. Juan Dela Cruz"
        },
        {
          id: "5",
          name: "Isabel Lim",
          email: "isabel.lim@up.edu.ph",
          thesisTitle: "Urban Planning and Traffic Management in Metro Manila",
          department: "Urban Planning",
          status: "at-risk",
          progress: 38,
          lastActive: "2024-12-15",
          nextMilestone: "Data Collection",
          advisorNotes: "Struggling with data collection methodology",
          pendingFeedback: true,
          advisorFeedbackCount: 4,
          studentResponseTime: 36.7,
          documentSubmissionRate: 0.5,
          activityScore: 28,
          riskLevel: "high",
          phase: "research",
          enrollmentDate: "2023-09-01",
          expectedGraduation: "2025-08-01",
          advisorId: "advisor-1",
          advisorName: "Dr. Juan Dela Cruz"
        }
      ];

      const mockAnalytics: AnalyticsData = {
        totalStudents: mockStudents.length,
        onTrackStudents: mockStudents.filter(s => s.status === "on-track").length,
        atRiskStudents: mockStudents.filter(s => s.status === "at-risk").length,
        completedStudents: mockStudents.filter(s => s.status === "completed").length,
        pendingReviews: mockStudents.filter(s => s.pendingFeedback).length,
        averageProgress: Math.round(mockStudents.reduce((sum, s) => sum + s.progress, 0) / mockStudents.length),
        averageActivityScore: Math.round(mockStudents.reduce((sum, s) => sum + s.activityScore, 0) / mockStudents.length),
        highRiskStudents: mockStudents.filter(s => s.riskLevel === "high").length,
        weeklySubmissions: [
          { date: "Dec 16", count: 3 },
          { date: "Dec 17", count: 5 },
          { date: "Dec 18", count: 2 },
          { date: "Dec 19", count: 7 },
          { date: "Dec 20", count: 4 },
          { date: "Dec 21", count: 6 },
          { date: "Dec 22", count: 8 }
        ],
        studentPhaseDistribution: [
          { name: "Proposal", value: mockStudents.filter(s => s.phase === "proposal").length },
          { name: "Research", value: mockStudents.filter(s => s.phase === "research").length },
          { name: "Writing", value: mockStudents.filter(s => s.phase === "writing").length },
          { name: "Defense", value: mockStudents.filter(s => s.phase === "defense").length }
        ],
        departmentDistribution: [
          { name: "CS", value: mockStudents.filter(s => s.department === "Computer Science").length },
          { name: "Econ", value: mockStudents.filter(s => s.department === "Economics").length },
          { name: "Bus", value: mockStudents.filter(s => s.department === "Business Administration").length },
          { name: "Ag", value: mockStudents.filter(s => s.department === "Agricultural Sciences").length },
          { name: "Plan", value: mockStudents.filter(s => s.department === "Urban Planning").length }
        ],
        advisorPerformance: {
          responseTime: 8.5, // hours
          feedbackQuality: 4.2, // 1-5 rating
          studentSatisfaction: 4.5 // 1-5 rating
        }
      };

      setStudents(mockStudents);
      setAnalyticsData(mockAnalytics);
      setIsLoading(false);
    }, 800);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.thesisTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    const matchesPhase = phaseFilter === "all" || student.phase === phaseFilter;
    const matchesRisk = riskFilter === "all" || student.riskLevel === riskFilter;
    
    return matchesSearch && matchesStatus && matchesPhase && matchesRisk;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on-track":
        return <Badge className="bg-green-500">On Track</Badge>;
      case "at-risk":
        return <Badge variant="destructive">At Risk</Badge>;
      case "needs-attention":
        return <Badge className="bg-yellow-500">Needs Attention</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return <Badge variant="outline" className="border-green-300 text-green-600">Low Risk</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-yellow-300 text-yellow-600">Medium Risk</Badge>;
      case "high":
        return <Badge variant="destructive">High Risk</Badge>;
      default:
        return <Badge variant="outline">{risk}</Badge>;
    }
  };

  const getPhaseBadge = (phase: string) => {
    switch (phase) {
      case "proposal":
        return <Badge variant="outline">Proposal</Badge>;
      case "research":
        return <Badge className="bg-blue-100 text-blue-800">Research</Badge>;
      case "writing":
        return <Badge className="bg-purple-100 text-purple-800">Writing</Badge>;
      case "defense":
        return <Badge className="bg-green-100 text-green-800">Defense</Badge>;
      default:
        return <Badge variant="outline">{phase}</Badge>;
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  const RISK_COLORS = ['#10B981', '#F59E0B', '#EF4444']; // Low, Medium, High risk

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const openStudentModal = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  return (
    <div className="space-y-6 overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Analytics</h2>
          <p className="text-muted-foreground">
            Track student progress and identify early warning indicators
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm">AI Analytics: Active</span>
        </div>
      </div>

      <Separator />

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalStudents}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.onTrackStudents}</div>
            <p className="text-xs text-muted-foreground">students progressing well</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.atRiskStudents}</div>
            <p className="text-xs text-muted-foreground">need immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageProgress}%</div>
            <Progress value={analyticsData.averageProgress} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">awaiting feedback</p>
          </CardContent>
        </Card>
      </div>

      {/* Student List Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>Student Progress Overview</CardTitle>
              <CardDescription>
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} displayed
              </CardDescription>
            </div>
            {/* Filters - Stack on mobile */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="on-track">On Track</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="needs-attention">Needs Attention</SelectItem>
                </SelectContent>
              </Select>

              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                  selectedStudent?.id === student.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setSelectedStudent(student)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Student Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{student.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{student.department}</div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(student.status)}
                    {getRiskBadge(student.riskLevel)}
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Progress value={student.progress} className="flex-1" />
                    <span className="text-sm font-medium w-10">{student.progress}%</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openStudentModal(student); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredStudents.length === 0 && (
              <div className="text-center py-10">
                <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No students found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Grid - 2 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Early Warning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Early Warning
            </CardTitle>
            <CardDescription>Students needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.filter(s => s.riskLevel === "high").map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950 dark:border-red-800">
                  <div className="min-w-0">
                    <div className="font-medium truncate text-red-900 dark:text-red-100">{student.name}</div>
                    <div className="text-xs text-red-700 dark:text-red-300">
                      {student.progress}% complete • {student.phase}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openStudentModal(student)}>View</Button>
                </div>
              ))}

              {students.filter(s => s.riskLevel === "high").length === 0 && (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
                  <p className="mt-2 text-sm text-muted-foreground">No high-risk students</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Advisor Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Your Performance</CardTitle>
            <CardDescription>Effectiveness metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Response Time</span>
                  <span className="font-medium">{analyticsData.advisorPerformance.responseTime}h</span>
                </div>
                <Progress value={(1 - analyticsData.advisorPerformance.responseTime / 24) * 100} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Feedback Quality</span>
                  <span className="font-medium">{analyticsData.advisorPerformance.feedbackQuality}/5</span>
                </div>
                <Progress value={analyticsData.advisorPerformance.feedbackQuality * 20} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Student Satisfaction</span>
                  <span className="font-medium">{analyticsData.advisorPerformance.studentSatisfaction}/5</span>
                </div>
                <Progress value={analyticsData.advisorPerformance.studentSatisfaction * 20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Phase Distribution</CardTitle>
            <CardDescription>Students by thesis phase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.studentPhaseDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {analyticsData.studentPhaseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Submissions</CardTitle>
            <CardDescription>Document activity this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.weeklySubmissions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Submissions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Detail Modal */}
      <Dialog open={isStudentModalOpen} onOpenChange={setIsStudentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{selectedStudent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{selectedStudent.name}</div>
                    <div className="text-sm font-normal text-muted-foreground">{selectedStudent.email}</div>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  {selectedStudent.department}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Status & Risk */}
                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(selectedStudent.status)}
                  {getRiskBadge(selectedStudent.riskLevel)}
                  {getPhaseBadge(selectedStudent.phase)}
                </div>

                {/* Thesis Title */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Thesis Title</h4>
                  <p className="font-medium">{selectedStudent.thesisTitle}</p>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{selectedStudent.progress}%</span>
                  </div>
                  <Progress value={selectedStudent.progress} className="h-3" />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Response Time</div>
                    <div className="text-xl font-bold">{selectedStudent.studentResponseTime}h</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Activity Score</div>
                    <div className="text-xl font-bold">{selectedStudent.activityScore}/100</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Submissions/Week</div>
                    <div className="text-xl font-bold">{selectedStudent.documentSubmissionRate}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Feedback Received</div>
                    <div className="text-xl font-bold">{selectedStudent.advisorFeedbackCount}</div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Enrolled:</span>
                    <span className="ml-2 font-medium">{new Date(selectedStudent.enrollmentDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected Graduation:</span>
                    <span className="ml-2 font-medium">{new Date(selectedStudent.expectedGraduation).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Active:</span>
                    <span className="ml-2 font-medium">{new Date(selectedStudent.lastActive).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Next Milestone:</span>
                    <span className="ml-2 font-medium">{selectedStudent.nextMilestone}</span>
                  </div>
                </div>

                {/* Advisor Notes */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Advisor Notes</h4>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    {selectedStudent.advisorNotes || "No notes yet."}
                  </div>
                </div>

                {/* Pending Feedback Indicator */}
                {selectedStudent.pendingFeedback && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">This student has pending feedback to review</span>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsStudentModalOpen(false)}>
                  Close
                </Button>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  View Documents
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PerformanceAnalytics;