"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, MessageCircle, Calendar } from "lucide-react";

interface AtRiskStudent {
  id: string;
  name: string;
  issue: string;
  lastActive: string;
  missedDeadlines: number;
  riskLevel: "high" | "medium";
}

export default function AtRiskStudentsPage() {
  const [students, setStudents] = useState<AtRiskStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStudents([
        { id: "1", name: "Juan Dela Cruz", issue: "Multiple missed deadlines, no response to messages", lastActive: "2024-12-15", missedDeadlines: 3, riskLevel: "high" },
        { id: "2", name: "Isabel Lim", issue: "Struggling with research methodology", lastActive: "2024-12-18", missedDeadlines: 1, riskLevel: "medium" },
        { id: "3", name: "Pedro Garcia", issue: "Low engagement, incomplete submissions", lastActive: "2024-12-10", missedDeadlines: 2, riskLevel: "high" },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "high": return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />High Risk</Badge>;
      case "medium": return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Medium Risk</Badge>;
      default: return <Badge variant="outline">{level}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-8 animate-pulse"><div className="h-8 w-64 bg-muted rounded mb-4" /><div className="h-64 bg-muted rounded" /></div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">At-Risk Students</h1>
        <p className="text-muted-foreground">Students who need immediate attention and intervention</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5" />Students Requiring Attention</CardTitle>
          <CardDescription>{students.length} students identified as at-risk</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="p-4 border border-red-200 rounded-lg bg-red-50/50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{student.name}</span>
                      {getRiskBadge(student.riskLevel)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{student.issue}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Last active: {new Date(student.lastActive).toLocaleDateString()}</span>
                      <span>Missed deadlines: {student.missedDeadlines}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><MessageCircle className="w-4 h-4 mr-1" />Message</Button>
                    <Button size="sm"><Calendar className="w-4 h-4 mr-1" />Schedule Meeting</Button>
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
