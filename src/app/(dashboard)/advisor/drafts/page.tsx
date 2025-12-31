"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Clock, Edit } from "lucide-react";

interface Draft {
  id: string;
  title: string;
  type: string;
  lastModified: string;
  status: "draft" | "in-review" | "completed";
}

export default function AdvisorDraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setDrafts([
        { id: "1", title: "Feedback Template - Literature Review", type: "Template", lastModified: "2024-12-22", status: "completed" },
        { id: "2", title: "Research Guidelines Document", type: "Guide", lastModified: "2024-12-20", status: "draft" },
        { id: "3", title: "Student Assessment Rubric", type: "Rubric", lastModified: "2024-12-18", status: "in-review" },
      ]);
      setIsLoading(false);
    }, 300);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft": return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case "in-review": return <Badge className="bg-blue-100 text-blue-800">In Review</Badge>;
      case "completed": return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-muted rounded mb-4" /><div className="h-64 bg-muted rounded" /></div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Drafts</h1>
          <p className="text-muted-foreground">Manage your documents and templates</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />New Draft</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Your saved drafts and templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div key={draft.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{draft.title}</div>
                    <div className="text-sm text-muted-foreground">{draft.type} - Last modified {new Date(draft.lastModified).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(draft.status)}
                  <Button size="sm" variant="outline"><Edit className="w-4 h-4 mr-1" />Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
