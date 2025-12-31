"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, FileCheck } from "lucide-react";

const rubrics = [
  { id: "1", name: "Thesis Chapter Evaluation", criteria: 8, maxScore: 100, status: "active" },
  { id: "2", name: "Literature Review Assessment", criteria: 6, maxScore: 50, status: "active" },
  { id: "3", name: "Methodology Quality Check", criteria: 10, maxScore: 100, status: "draft" },
  { id: "4", name: "Defense Presentation Rubric", criteria: 5, maxScore: 50, status: "active" },
];

export default function RubricBuilderPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rubric Builder</h1>
          <p className="text-muted-foreground">Create and manage evaluation rubrics</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />New Rubric</Button>
      </div>

      <div className="grid gap-4">
        {rubrics.map((rubric) => (
          <Card key={rubric.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <CardTitle>{rubric.name}</CardTitle>
                    <CardDescription>{rubric.criteria} criteria - Max score: {rubric.maxScore}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={rubric.status === "active" ? "default" : "outline"}>{rubric.status}</Badge>
                  <Button size="sm" variant="outline"><Edit className="w-4 h-4 mr-1" />Edit</Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
