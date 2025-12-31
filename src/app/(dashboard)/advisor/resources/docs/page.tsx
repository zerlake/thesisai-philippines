"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink } from "lucide-react";

const documents = [
  { title: "Advisor Handbook 2024-2025", type: "PDF", size: "2.4 MB" },
  { title: "Feedback Template Collection", type: "DOCX", size: "1.1 MB" },
  { title: "Assessment Rubrics Pack", type: "XLSX", size: "856 KB" },
  { title: "Defense Evaluation Forms", type: "PDF", size: "524 KB" },
  { title: "Student Progress Report Template", type: "DOCX", size: "342 KB" },
  { title: "Ethics Clearance Checklist", type: "PDF", size: "218 KB" },
];

export default function DocumentationPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="text-muted-foreground">Downloadable resources and templates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Documents</CardTitle>
          <CardDescription>Download templates and reference materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{doc.title}</div>
                    <div className="text-sm text-muted-foreground">{doc.type} - {doc.size}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-1" />Download</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
