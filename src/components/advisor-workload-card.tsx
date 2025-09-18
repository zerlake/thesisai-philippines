"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Clock, Users } from "lucide-react";

interface AdvisorWorkloadCardProps {
  studentCount: number;
  pendingReviews: number;
}

export function AdvisorWorkloadCard({ studentCount, pendingReviews }: AdvisorWorkloadCardProps) {
  const getWorkloadStatus = () => {
    const score = studentCount + (pendingReviews * 2); // Weight reviews more heavily
    if (score < 5) return { text: "Low", color: "text-green-600" };
    if (score < 10) return { text: "Medium", color: "text-yellow-600" };
    return { text: "High", color: "text-red-600" };
  };

  const workload = getWorkloadStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Workload</CardTitle>
        <CardDescription>A summary of your advising responsibilities.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-muted-foreground" />
            <p>Advised Students</p>
          </div>
          <p className="font-bold text-lg">{studentCount}</p>
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <p>Pending Reviews</p>
          </div>
          <p className="font-bold text-lg">{pendingReviews}</p>
        </div>
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">Estimated Workload</p>
          <p className={`text-2xl font-bold ${workload.color}`}>{workload.text}</p>
        </div>
      </CardContent>
    </Card>
  );
}