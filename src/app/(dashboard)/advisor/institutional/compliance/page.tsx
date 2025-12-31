"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, FileCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const complianceItems = [
  { student: "Maria Santos", ethicsApproval: true, formatCheck: true, plagiarismCheck: true, advisorSignoff: false },
  { student: "Juan Dela Cruz", ethicsApproval: true, formatCheck: false, plagiarismCheck: true, advisorSignoff: false },
  { student: "Ana Reyes", ethicsApproval: false, formatCheck: false, plagiarismCheck: true, advisorSignoff: false },
  { student: "Carlos Gomez", ethicsApproval: true, formatCheck: true, plagiarismCheck: true, advisorSignoff: true },
];

export default function ComplianceCheckPage() {
  const getIcon = (status: boolean) => status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;

  const getComplianceScore = (item: typeof complianceItems[0]) => {
    const checks = [item.ethicsApproval, item.formatCheck, item.plagiarismCheck, item.advisorSignoff];
    return (checks.filter(Boolean).length / checks.length) * 100;
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Compliance Check</h1>
        <p className="text-muted-foreground">Track student compliance with institutional requirements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5" />Student Compliance Status</CardTitle>
          <CardDescription>Required approvals and checks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {complianceItems.map((item, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">{item.student}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={getComplianceScore(item)} className="w-24 h-2" />
                    <span className="text-sm font-medium">{Math.round(getComplianceScore(item))}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">{getIcon(item.ethicsApproval)}<span className="text-sm">Ethics Approval</span></div>
                  <div className="flex items-center gap-2">{getIcon(item.formatCheck)}<span className="text-sm">Format Check</span></div>
                  <div className="flex items-center gap-2">{getIcon(item.plagiarismCheck)}<span className="text-sm">Plagiarism Check</span></div>
                  <div className="flex items-center gap-2">{getIcon(item.advisorSignoff)}<span className="text-sm">Advisor Sign-off</span></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
