"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";

export default function QualityAssurancePage() {
  const metrics = [
    { label: "Feedback Timeliness", value: 92, target: 95, status: "good" },
    { label: "Student Satisfaction", value: 88, target: 85, status: "excellent" },
    { label: "Revision Success Rate", value: 76, target: 80, status: "needs-improvement" },
    { label: "Documentation Completeness", value: 95, target: 90, status: "excellent" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quality Assurance</h1>
        <p className="text-muted-foreground">Monitor and improve feedback quality metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">{metric.value}%</span>
                <Badge variant={metric.status === "excellent" ? "default" : metric.status === "good" ? "secondary" : "destructive"}>
                  {metric.status === "excellent" ? <CheckCircle className="w-3 h-3 mr-1" /> : metric.status === "needs-improvement" ? <AlertTriangle className="w-3 h-3 mr-1" /> : null}
                  {metric.status.replace("-", " ")}
                </Badge>
              </div>
              <Progress value={metric.value} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">Target: {metric.target}%</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" />Quality Guidelines</CardTitle>
          <CardDescription>Best practices for providing effective feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /><span>Provide specific, actionable feedback within 48 hours of submission</span></li>
            <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /><span>Include both strengths and areas for improvement in each review</span></li>
            <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /><span>Reference specific sections and provide concrete examples</span></li>
            <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /><span>Follow up on revisions to ensure understanding</span></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
