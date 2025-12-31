"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const guidelines = [
  { title: "Thesis Format Guidelines", version: "2024.1", lastUpdated: "2024-09-01", pages: 45 },
  { title: "Citation Style Manual (APA 7th)", version: "7.0", lastUpdated: "2024-06-15", pages: 32 },
  { title: "Defense Procedures", version: "2024.2", lastUpdated: "2024-10-01", pages: 18 },
  { title: "Ethics and Plagiarism Policy", version: "2024.1", lastUpdated: "2024-08-01", pages: 12 },
  { title: "Graduate Program Handbook", version: "2024-2025", lastUpdated: "2024-07-01", pages: 85 },
];

export default function ThesisGuidelinesPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thesis Guidelines</h1>
        <p className="text-muted-foreground">Institutional guidelines and requirements</p>
      </div>

      <div className="grid gap-4">
        {guidelines.map((guide, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <CardTitle>{guide.title}</CardTitle>
                    <CardDescription>Version {guide.version} - {guide.pages} pages</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Updated {new Date(guide.lastUpdated).toLocaleDateString()}</span>
                  <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-1" />Download</Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
