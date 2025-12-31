"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertTriangle, Calendar } from "lucide-react";

export default function TimelineTrackingPage() {
  const timeline = [
    { student: "Maria Santos", milestone: "Final Defense", dueDate: "2025-01-25", status: "on-track", daysLeft: 28 },
    { student: "Juan Dela Cruz", milestone: "Chapter 3 Submission", dueDate: "2025-01-10", status: "at-risk", daysLeft: 13 },
    { student: "Ana Reyes", milestone: "Literature Review", dueDate: "2025-01-15", status: "on-track", daysLeft: 18 },
    { student: "Carlos Gomez", milestone: "Defense Preparation", dueDate: "2025-01-20", status: "ahead", daysLeft: 23 },
    { student: "Isabel Lim", milestone: "Methodology Approval", dueDate: "2025-01-08", status: "behind", daysLeft: 11 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ahead": return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Ahead</Badge>;
      case "on-track": return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />On Track</Badge>;
      case "at-risk": return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />At Risk</Badge>;
      case "behind": return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Behind</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timeline Tracking</h1>
        <p className="text-muted-foreground">Monitor student progress against deadlines</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Upcoming Deadlines</CardTitle>
          <CardDescription>Student milestones sorted by due date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline.sort((a, b) => a.daysLeft - b.daysLeft).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{item.student}</div>
                  <div className="text-sm text-muted-foreground">{item.milestone}</div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(item.status)}
                  <div className="text-right">
                    <div className="font-medium">{item.daysLeft} days</div>
                    <div className="text-xs text-muted-foreground">{new Date(item.dueDate).toLocaleDateString()}</div>
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
