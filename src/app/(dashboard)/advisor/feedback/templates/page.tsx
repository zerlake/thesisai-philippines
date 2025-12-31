"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Copy, Edit, Trash2 } from "lucide-react";

const templates = [
  { id: "1", name: "Chapter Review Feedback", category: "Review", usageCount: 45, lastUsed: "2024-12-22" },
  { id: "2", name: "Methodology Critique", category: "Methodology", usageCount: 32, lastUsed: "2024-12-20" },
  { id: "3", name: "Literature Gap Analysis", category: "Literature", usageCount: 28, lastUsed: "2024-12-18" },
  { id: "4", name: "Writing Style Suggestions", category: "Writing", usageCount: 51, lastUsed: "2024-12-21" },
  { id: "5", name: "Defense Preparation Notes", category: "Defense", usageCount: 15, lastUsed: "2024-12-15" },
];

export default function FeedbackTemplatesPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback Templates</h1>
          <p className="text-muted-foreground">Create and manage reusable feedback templates</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />New Template</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <Badge variant="outline">{template.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                <p>Used {template.usageCount} times</p>
                <p>Last used: {new Date(template.lastUsed).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1"><Copy className="w-3 h-3 mr-1" />Use</Button>
                <Button size="sm" variant="outline"><Edit className="w-3 h-3" /></Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700"><Trash2 className="w-3 h-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
