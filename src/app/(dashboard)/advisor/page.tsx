"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Target, 
  Calendar,
  BarChart3,
  User,
  GraduationCap,
  Award,
  Activity,
  MessageCircle,
  FileCheck,
  TrendingUp,
  PieChart,
  FileSearch,
  Notebook,
  BookOpen,
  UserCheck,
  Settings,
  Bell,
  Mail,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  MoreVertical
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

// Define types
interface Student {
  id: string;
  name: string;
  email: string;
  thesisTitle: string;
  status: "on-track" | "at-risk" | "needs-attention" | "completed";
  progress: number;
  lastActive: string;
  nextMilestone: string;
  advisorNotes: string;
  pendingFeedback: boolean;
  department: string;
  enrollmentDate: string;
  expectedGraduation: string;
}

interface Assignment {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  type: "proposal" | "chapter" | "draft" | "defense";
  status: "pending" | "reviewed" | "approved" | "revisions-needed";
  submittedAt: string;
  dueDate: string;
  advisorFeedback: string;
  grade?: number;
}

interface Meeting {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  date: string;
  time: string;
  type: "advisory" | "proposal-defense" | "midterm-defense" | "final-defense";
  status: "scheduled" | "completed" | "cancelled";
  notes: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "urgent";
  createdAt: string;
  read: boolean;
}

const AdvisorDashboardPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    onTrackStudents: 0,
    atRiskStudents: 0,
    pendingReviews: 0,
    upcomingMeetings: 0
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data initialization
  useEffect(() => {
    // Simulate API call to fetch data
    setTimeout(() => {
      const mockStudents: Student[] = [
        {
          id: "1",
          name: "Maria Santos",
          email: "maria.santos@up.edu.ph",
          thesisTitle: "Impact of Social Media on Academic Performance",
          status: "on-track",
          progress: 78,
          lastActive: "2024-12-22",
          nextMilestone: "Chapter 3 Draft",
          advisorNotes: "Good progress on methodology section",
          pendingFeedback: false,
          department: "Computer Science",
          enrollmentDate: "2023-09-01",
          expectedGraduation: "2025-05-01"
        },
        {
          id: "2",
          name: "Juan Dela Cruz",
          email: "juan.dc@up.edu.ph",
          thesisTitle: "Economic Impacts of Climate Change in Rural Philippines",
          status: "at-risk",
          progress: 45,
          lastActive: "2024-12-20",
          nextMilestone: "Literature Review",
          advisorNotes: "Needs to improve research methodology",
          pendingFeedback: true,
          department: "Economics",
          enrollmentDate: "2023-09-01",
          expectedGraduation: "2025-05-01"
        },
        {
          id: "3",
          name: "Ana Reyes",
          email: "ana.reyes@up.edu.ph",
          thesisTitle: "Digital Transformation in Philippine Banking",
          status: "needs-attention",
          progress: 62,
          lastActive: "2024-12-21",
          nextMilestone: "Methodology Approval",
          advisorNotes: "Awaiting revisions on literature review",
          pendingFeedback: true,
          department: "Business Administration",
          enrollmentDate: "2023-09-01",
          expectedGraduation: "2025-05-01"
        },
        {
          id: "4",
          name: "Carlos Gomez",
          email: "carlos.gomez@up.edu.ph",
          thesisTitle: "Sustainable Agriculture Practices in Mindanao",
          status: "on-track",
          progress: 89,
          lastActive: "2024-12-22",
          nextMilestone: "Final Defense",
          advisorNotes: "Ready for defense",
          pendingFeedback: false,
          department: "Agricultural Sciences",
          enrollmentDate: "2023-09-01",
          expectedGraduation: "2025-03-01"
        },
        {
          id: "5",
          name: "Isabel Lim",
          email: "isabel.lim@up.edu.ph",
          thesisTitle: "Urban Planning and Traffic Management in Metro Manila",
          status: "at-risk",
          progress: 38,
          lastActive: "2024-12-18",
          nextMilestone: "Data Collection",
          advisorNotes: "Struggling with data collection methodology",
          pendingFeedback: true,
          department: "Urban Planning",
          enrollmentDate: "2023-09-01",
          expectedGraduation: "2025-08-01"
        }
      ];

      const mockAssignments: Assignment[] = [
        {
          id: "1",
          studentId: "1",
          studentName: "Maria Santos",
          title: "Chapter 2 Literature Review",
          type: "chapter",
          status: "reviewed",
          submittedAt: "2024-12-15",
          dueDate: "2024-12-15",
          advisorFeedback: "Good literature review. Need to expand on recent studies from 2023-2024.",
          grade: 85
        },
        {
          id: "2",
          studentId: "2",
          studentName: "Juan Dela Cruz",
          title: "Research Proposal",
          type: "proposal",
          status: "revisions-needed",
          submittedAt: "2024-12-10",
          dueDate: "2024-12-10",
          advisorFeedback: "Research methodology needs significant improvements. Please review sampling technique."
        },
        {
          id: "3",
          studentId: "3",
          studentName: "Ana Reyes",
          title: "Chapter 1 Introduction",
          type: "chapter",
          status: "pending",
          submittedAt: "2024-12-18",
          dueDate: "2024-12-18",
          advisorFeedback: "",
          grade: 0
        }
      ];

      const mockMeetings: Meeting[] = [
        {
          id: "1",
          studentId: "1",
          studentName: "Maria Santos",
          title: "Chapter 3 Review Meeting",
          date: "2024-12-28",
          time: "10:00 AM",
          type: "advisory",
          status: "scheduled",
          notes: "Discuss methodology approach and data collection plans"
        },
        {
          id: "2",
          studentId: "2",
          studentName: "Juan Dela Cruz",
          title: "Proposal Defense Preparation",
          date: "2024-12-30",
          time: "2:00 PM",
          type: "advisory",
          status: "scheduled",
          notes: "Review proposal and prepare for defense questions"
        },
        {
          id: "3",
          studentId: "4",
          studentName: "Carlos Gomez",
          title: "Final Defense",
          date: "2025-01-15",
          time: "9:00 AM",
          type: "final-defense",
          status: "scheduled",
          notes: "Final thesis defense"
        }
      ];

      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "New Document Submitted",
          message: "Maria Santos submitted Chapter 3 draft for review",
          type: "info",
          createdAt: "2024-12-22T09:30:00Z",
          read: false
        },
        {
          id: "2",
          title: "Upcoming Deadline",
          message: "Juan Dela Cruz has proposal revision due tomorrow",
          type: "warning",
          createdAt: "2024-12-21T14:22:00Z",
          read: false
        },
        {
          id: "3",
          title: "Meeting Request",
          message: "Ana Reyes requested advisory meeting for next week",
          type: "info",
          createdAt: "2024-12-20T16:45:00Z",
          read: true
        }
      ];

      setStudents(mockStudents);
      setAssignments(mockAssignments);
      setMeetings(mockMeetings);
      setNotifications(mockNotifications);

      // Calculate stats
      setStats({
        totalStudents: mockStudents.length,
        onTrackStudents: mockStudents.filter(s => s.status === "on-track").length,
        atRiskStudents: mockStudents.filter(s => s.status === "at-risk").length,
        pendingReviews: mockStudents.filter(s => s.pendingFeedback).length + mockAssignments.filter(a => a.status === "pending").length,
        upcomingMeetings: mockMeetings.filter(m => m.status === "scheduled").length
      });
    }, 500);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on-track":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">On Track</Badge>;
      case "at-risk":
        return <Badge variant="destructive">At Risk</Badge>;
      case "needs-attention":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Needs Attention</Badge>;
      case "completed":
        return <Badge variant="outline" className="border-gray-300 text-gray-600">Completed</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "reviewed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Reviewed</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "revisions-needed":
        return <Badge variant="destructive">Revisions Needed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "proposal":
        return <Badge variant="outline">Proposal</Badge>;
      case "chapter":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Chapter</Badge>;
      case "draft":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Draft</Badge>;
      case "defense":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Defense</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.thesisTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advisor Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your assigned students and academic responsibilities
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm">AI Connection: Active</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onTrackStudents}</div>
            <p className="text-xs text-muted-foreground">students progressing well</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.atRiskStudents}</div>
            <p className="text-xs text-muted-foreground">need immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">awaiting feedback</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingMeetings}</div>
            <p className="text-xs text-muted-foreground">next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students, thesis titles..."
            className="pl-8 w-full md:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="on-track">On Track</SelectItem>
            <SelectItem value="at-risk">At Risk</SelectItem>
            <SelectItem value="needs-attention">Needs Attention</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Assigned Students</CardTitle>
            <div className="text-sm text-muted-foreground">
              {filteredStudents.length} of {students.length} students
            </div>
          </div>
          <CardDescription>
            Overview of your assigned students and their thesis progress
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                {/* Top row - Name and Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}&backgroundColor=b6e6ff&fontSize=32`} alt={student.name} />
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{student.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{student.email}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    {getStatusBadge(student.status)}
                    {student.pendingFeedback && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Thesis Title */}
                <div className="mb-3">
                  <div className="font-medium truncate">{student.thesisTitle}</div>
                  <div className="text-sm text-muted-foreground">{student.department}</div>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3 text-sm">
                  <div className="p-2 bg-muted/50 rounded">
                    <div className="font-medium">{student.progress}%</div>
                    <Progress value={student.progress} className="mt-1" />
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <div className="font-medium truncate">{new Date(student.lastActive).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">Last active</div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded hidden sm:block">
                    <div className="font-medium truncate">{student.nextMilestone}</div>
                    <div className="text-xs text-muted-foreground">Next milestone</div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/advisor/students/${student.id}`}>
                      <User className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">View Profile</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/advisor/students/documents">
                      <FileText className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Documents</span>
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/advisor/messages">
                      <MessageCircle className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Message</span>
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
            <CardDescription>
              Documents awaiting your feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments
                .filter(assignment => assignment.status === "pending")
                .map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{assignment.title}</div>
                      <div className="text-sm text-muted-foreground">{assignment.studentName}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTypeBadge(assignment.type)}
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              {assignments.filter(a => a.status === "pending").length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No pending reviews
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription>
              Scheduled advisory meetings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {meetings
                .filter(meeting => meeting.status === "scheduled")
                .slice(0, 3) // Show only next 3 meetings
                .map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{meeting.title}</div>
                      <div className="text-sm text-muted-foreground">{meeting.studentName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{new Date(meeting.date).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">{meeting.time}</div>
                    </div>
                  </div>
                ))}
              {meetings.filter(m => m.status === "scheduled").length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No upcoming meetings
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            Important updates and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start p-3 rounded-lg border-l-4 ${
                  notification.type === 'urgent' ? 'border-l-red-500 bg-red-50 dark:bg-red-950' :
                  notification.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
                  notification.type === 'success' ? 'border-l-green-500 bg-green-50 dark:bg-green-950' :
                  'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
                }`}
              >
                <div className="mr-3 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${
                    notification.type === 'urgent' ? 'text-red-900 dark:text-red-100' :
                    notification.type === 'warning' ? 'text-yellow-900 dark:text-yellow-100' :
                    notification.type === 'success' ? 'text-green-900 dark:text-green-100' :
                    'text-blue-900 dark:text-blue-100'
                  }`}>{notification.title}</div>
                  <div className={`text-sm ${
                    notification.type === 'urgent' ? 'text-red-700 dark:text-red-300' :
                    notification.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                    notification.type === 'success' ? 'text-green-700 dark:text-green-300' :
                    'text-blue-700 dark:text-blue-300'
                  }`}>{notification.message}</div>
                  <div className={`text-xs mt-1 ${
                    notification.type === 'urgent' ? 'text-red-600 dark:text-red-400' :
                    notification.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                    notification.type === 'success' ? 'text-green-600 dark:text-green-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
                {!notification.read && (
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">New</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvisorDashboardPage;