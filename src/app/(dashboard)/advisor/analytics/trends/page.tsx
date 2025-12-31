"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function TrendAnalysisPage() {
  const trends = [
    { metric: "Average Completion Time", current: "4.2 months", change: -12, trend: "improving" },
    { metric: "Student Engagement", current: "78%", change: 5, trend: "improving" },
    { metric: "Feedback Response Time", current: "1.8 days", change: -8, trend: "improving" },
    { metric: "Revision Cycles", current: "2.3 avg", change: 0, trend: "stable" },
    { metric: "Defense Success Rate", current: "94%", change: 3, trend: "improving" },
    { metric: "At-Risk Detection", current: "89%", change: -2, trend: "declining" },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === "improving") return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (trend === "declining") return <TrendingDown className="h-5 w-5 text-red-500" />;
    return <Minus className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trend Analysis</h1>
        <p className="text-muted-foreground">Track performance trends over time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trends.map((item, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{item.metric}</CardTitle>
                {getTrendIcon(item.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.current}</div>
              <p className={`text-sm ${item.change > 0 ? 'text-green-600' : item.change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {item.change > 0 ? '+' : ''}{item.change}% from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
