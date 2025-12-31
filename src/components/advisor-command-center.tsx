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
  Calendar,
  MessageCircle,
  UserPlus,
  Download,
  Search
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  thesisTitle: string;
  status: "on-track" | "at-risk" | "needs-attention" | "completed";
  progress: number;
  lastActive: string;
  nextMilestone: string;
  advisorNotes: string;
  pendingFeedback: boolean;
  lastFeedbackDate?: string;
}

interface AdvisorDashboardStats {
  totalStudents: number;
  onTrackStudents: number;
  atRiskStudents: number;
  pendingReviews: number;
  upcomingMeetings: number;
}

const AdvisorCommandCenter = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<AdvisorDashboardStats>({
    totalStudents: 0,
    onTrackStudents: 0,
    atRiskStudents: 0,
    pendingReviews: 0,
    upcomingMeetings: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockStudents: Student[] = [
        {
          id: "1",
          name: "Maria Santos",
          email: "maria.santos@up.edu.ph",
          avatar: "",
          thesisTitle: "Impact of Social Media on Academic Performance",
          status: "on-track",
          progress: 75,
          lastActive: "2024-12-20",
          nextMilestone: "Chapter 3 Draft",
          advisorNotes: "Good progress on methodology section",
          pendingFeedback: false,
          lastFeedbackDate: "2024-12-18"
        },
        {
          id: "2",
          name: "Juan Dela Cruz",
          email: "juan.dc@up.edu.ph",
          avatar: "",
          thesisTitle: "Economic Impacts of Climate Change in Rural Philippines",
          status: "at-risk",
          progress: 40,
          lastActive: "2024-12-15",
          nextMilestone: "Literature Review",
          advisorNotes: "Needs to improve research methodology",
          pendingFeedback: true
        },
        {
          id: "3",
          name: "Ana Reyes",
          email: "ana.reyes@up.edu.ph",
          avatar: "",
          thesisTitle: "Digital Transformation in Philippine Banking",
          status: "needs-attention",
          progress: 60,
          lastActive: "2024-12-18",
          nextMilestone: "Chapter 2 Completion",
          advisorNotes: "Awaiting revisions on literature review",
          pendingFeedback: true
        },
        {
          id: "4",
          name: "Carlos Gomez",
          email: "carlos.gomez@up.edu.ph",
          avatar: "",
          thesisTitle: "Sustainable Agriculture Practices in Mindanao",
          status: "on-track",
          progress: 85,
          lastActive: "2024-12-22",
          nextMilestone: "Final Defense Preparation",
          advisorNotes: "Excellent progress, ready for defense",
          pendingFeedback: false,
          lastFeedbackDate: "2024-12-20"
        },
        {
          id: "5",
          name: "Isabel Lim",
          email: "isabel.lim@up.edu.ph",
          avatar: "",
          thesisTitle: "Urban Planning and Traffic Management in Metro Manila",
          status: "on-track",
          progress: 55,
          lastActive: "2024-12-19",
          nextMilestone: "Methodology Approval",
          advisorNotes: "Methodology section needs more detail",
          pendingFeedback: false,
          lastFeedbackDate: "2024-12-17"
        }
      ];

      setStudents(mockStudents);
      setStats({
        totalStudents: mockStudents.length,
        onTrackStudents: mockStudents.filter(s => s.status === "on-track").length,
        atRiskStudents: mockStudents.filter(s => s.status === "at-risk").length,
        pendingReviews: mockStudents.filter(s => s.pendingFeedback).length,
        upcomingMeetings: 3 // Mock value
      });
      setIsLoading(false);
    }, 800);
  }, []);

  // Filter students based on search term and status
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.thesisTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on-track":
        return <Badge variant="default" className="bg-green-100 text-green-800">On Track</Badge>;
      case "at-risk":
        return <Badge variant="destructive" className="bg-red-100 text-red-800">At Risk</Badge>;
      case "needs-attention":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Needs Attention</Badge>;
      case "completed":
        return <Badge variant="outline" className="border-gray-300 text-gray-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onTrackStudents}</div>
            <p className="text-xs text-muted-foreground">students progressing well</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.atRiskStudents}</div>
            <p className="text-xs text-muted-foreground">need immediate attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">awaiting feedback</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingMeetings}</div>
            <p className="text-xs text-muted-foreground">next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students or thesis titles..."
              className="pl-8 w-full md:w-[300px]"
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
              <SelectItem value="needs-attention">Needs Attention</SelectItem>
              <SelectItem value="at-risk">At Risk</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Students</CardTitle>
          <CardDescription>
            {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} assigned to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">No students found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div key={student.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  {/* Top row - Name and Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={student.avatar} alt={student.name} />
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
                    <div className="text-sm text-muted-foreground">Next: {student.nextMilestone}</div>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="font-medium">{student.progress}%</div>
                      <Progress value={student.progress} className="mt-1" />
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="font-medium truncate">{new Date(student.lastActive).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">Last active</div>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Message</span>
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Review</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Bulk Message
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Bulk Review
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex justify-between">
                <span>Thesis Proposal</span>
                <span className="font-medium">Dec 28, 2024</span>
              </li>
              <li className="flex justify-between">
                <span>Chapter 2 Submission</span>
                <span className="font-medium">Jan 5, 2025</span>
              </li>
              <li className="flex justify-between">
                <span>Midterm Defense</span>
                <span className="font-medium">Jan 15, 2025</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>At-Risk Students</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {students
                .filter(s => s.status === "at-risk")
                .map(student => (
                  <li key={student.id} className="flex justify-between">
                    <span className="truncate">{student.name}</span>
                    <Badge variant="destructive" className="h-6 px-2">At Risk</Badge>
                  </li>
                ))}
            </ul>
            {students.filter(s => s.status === "at-risk").length === 0 && (
              <p className="text-sm text-muted-foreground">No at-risk students</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvisorCommandCenter;