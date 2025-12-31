"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, MessageCircle, Clock } from "lucide-react";

interface Document {
  id: string;
  title: string;
  studentName: string;
  type: string;
  status: "pending" | "reviewed" | "approved" | "needs-revision";
  submittedAt: string;
}

export default function DocumentReviewsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setDocuments([
        { id: "1", title: "Chapter 1 - Introduction", studentName: "Maria Santos", type: "Chapter", status: "pending", submittedAt: "2024-12-22" },
        { id: "2", title: "Literature Review Draft", studentName: "Juan Dela Cruz", type: "Draft", status: "needs-revision", submittedAt: "2024-12-20" },
        { id: "3", title: "Research Methodology", studentName: "Ana Reyes", type: "Chapter", status: "reviewed", submittedAt: "2024-12-19" },
        { id: "4", title: "Final Thesis Draft", studentName: "Carlos Gomez", type: "Final", status: "approved", submittedAt: "2024-12-18" },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "reviewed": return <Badge className="bg-blue-100 text-blue-800">Reviewed</Badge>;
      case "approved": return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "needs-revision": return <Badge variant="destructive">Needs Revision</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-8 animate-pulse"><div className="h-8 w-64 bg-muted rounded mb-4" /><div className="h-64 bg-muted rounded" /></div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Reviews</h1>
        <p className="text-muted-foreground">Review and provide feedback on student submissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
          <CardDescription>Documents awaiting your feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{doc.title}</div>
                    <div className="text-sm text-muted-foreground">{doc.studentName} - {doc.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(doc.status)}
                  <div className="text-sm text-muted-foreground">{new Date(doc.submittedAt).toLocaleDateString()}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-1" />View</Button>
                    <Button size="sm"><MessageCircle className="w-4 h-4 mr-1" />Feedback</Button>
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
