"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface StudentMilestone {
  id: string;
  name: string;
  currentMilestone: string;
  nextDeadline: string;
  progress: number;
  status: "ahead" | "on-track" | "behind";
}

export default function MilestoneTrackingPage() {
  const [students, setStudents] = useState<StudentMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStudents([
        { id: "1", name: "Maria Santos", currentMilestone: "Chapter 3 - Methodology", nextDeadline: "2025-01-15", progress: 78, status: "on-track" },
        { id: "2", name: "Juan Dela Cruz", currentMilestone: "Literature Review", nextDeadline: "2025-01-10", progress: 45, status: "behind" },
        { id: "3", name: "Ana Reyes", currentMilestone: "Chapter 2 Revisions", nextDeadline: "2025-01-20", progress: 62, status: "on-track" },
        { id: "4", name: "Carlos Gomez", currentMilestone: "Final Defense Prep", nextDeadline: "2025-01-25", progress: 95, status: "ahead" },
        { id: "5", name: "Isabel Lim", currentMilestone: "Research Design", nextDeadline: "2025-01-08", progress: 38, status: "behind" },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ahead": return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Ahead</Badge>;
      case "on-track": return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />On Track</Badge>;
      case "behind": return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Behind</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-8 animate-pulse"><div className="h-8 w-64 bg-muted rounded mb-4" /><div className="h-64 bg-muted rounded" /></div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Milestone Tracking</h1>
        <p className="text-muted-foreground">Track student progress against thesis milestones</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Student Milestones</CardTitle>
          <CardDescription>Current milestone status for all advisees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-muted-foreground">{student.currentMilestone}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(student.status)}
                    <div className="text-sm text-muted-foreground">Due: {new Date(student.nextDeadline).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={student.progress} className="flex-1" />
                  <span className="text-sm font-medium w-12">{student.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
