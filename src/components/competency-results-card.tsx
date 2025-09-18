"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";

interface CompetencyResultsCardProps {
  results: {
    overall: number;
    competencies: {
      id: string;
      title: string;
      score: number;
    }[];
  };
  onReset: () => void;
}

const scoreLabels: { [key: number]: string } = {
  1: "Developing",
  2: "Proficient",
  3: "Advanced",
  4: "Expert",
};

export function CompetencyResultsCard({ results, onReset }: CompetencyResultsCardProps) {
  const getOverallLabel = (score: number) => {
    if (score < 1.5) return "Developing";
    if (score < 2.5) return "Proficient";
    if (score < 3.5) return "Advanced";
    return "Expert";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Your Self-Assessment Results</CardTitle>
            <CardDescription>This is a snapshot of your self-perceived strengths.</CardDescription>
          </div>
          <Button variant="outline" onClick={onReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Overall Competency</p>
          <p className="text-4xl font-bold">{results.overall.toFixed(1)}</p>
          <p className="font-semibold">{getOverallLabel(results.overall)}</p>
        </div>
        <div className="space-y-4">
          {results.competencies.map(comp => (
            <div key={comp.id}>
              <div className="flex justify-between items-baseline mb-1">
                <p className="font-medium">{comp.title}</p>
                <p className="text-sm text-muted-foreground">{scoreLabels[Math.round(comp.score)]} ({comp.score.toFixed(1)})</p>
              </div>
              <Progress value={(comp.score / 4) * 100} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}