"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Target,
  Award
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";

interface StudentStats {
  id: string;
  name: string;
  progress: number;
  status: "on-track" | "at-risk" | "needs-attention" | "completed";
  lastActive: string;
  documentsSubmitted: number;
  feedbackPending: number;
}

export default function StudentAnalyticsPage() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<StudentStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo purposes
    setTimeout(() => {
      setStudents([
        {
          id: "1",
          name: "Maria Santos",
          progress: 78,
          status: "on-track",
          lastActive: "2024-12-22",
          documentsSubmitted: 12,
          feedbackPending: 1
        },
        {
          id: "2",
          name: "Juan Dela Cruz",
          progress: 45,
          status: "at-risk",
          lastActive: "2024-12-20",
          documentsSubmitted: 6,
          feedbackPending: 3
        },
        {
          id: "3",
          name: "Ana Reyes",
          progress: 62,
          status: "needs-attention",
          lastActive: "2024-12-21",
          documentsSubmitted: 8,
          feedbackPending: 2
        },
        {
          id: "4",
          name: "Carlos Gomez",
          progress: 95,
          status: "completed",
          lastActive: "2024-12-22",
          documentsSubmitted: 18,
          feedbackPending: 0
        },
        {
          id: "5",
          name: "Isabel Lim",
          progress: 38,
          status: "at-risk",
          lastActive: "2024-12-18",
          documentsSubmitted: 4,
          feedbackPending: 2
        }
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on-track":
        return <Badge className="bg-green-100 text-green-800">On Track</Badge>;
      case "at-risk":
        return <Badge variant="destructive">At Risk</Badge>;
      case "needs-attention":
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Attention</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: students.length,
    onTrack: students.filter(s => s.status === "on-track").length,
    atRisk: students.filter(s => s.status === "at-risk").length,
    completed: students.filter(s => s.status === "completed").length,
    avgProgress: students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length)
      : 0
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Progress Analytics</h1>
          <p className="text-muted-foreground">
            Track and analyze student performance across your advisees
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Active advisees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.onTrack}</div>
            <p className="text-xs text-muted-foreground">Progressing well</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.atRisk}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress}%</div>
            <Progress value={stats.avgProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Student List with Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Student Progress Overview</CardTitle>
          <CardDescription>
            Individual progress tracking for all your advisees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{student.name}</div>
                    {getStatusBadge(student.status)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Last active: {new Date(student.lastActive).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm font-medium">{student.documentsSubmitted}</div>
                    <div className="text-xs text-muted-foreground">Documents</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-medium">{student.feedbackPending}</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>

                  <div className="w-32">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{student.progress}%</span>
                    </div>
                    <Progress value={student.progress} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
