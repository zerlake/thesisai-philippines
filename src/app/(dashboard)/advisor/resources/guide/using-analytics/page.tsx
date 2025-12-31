"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart, TrendingUp, Activity, Target, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function UsingAnalyticsGuidePage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/advisor/resources/guide">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guide
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Using Analytics</h1>
        <p className="text-muted-foreground">
          Understanding performance metrics and reports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The Performance Analytics page provides AI-powered insights into student progress and engagement. 
            Use these metrics to identify trends and intervene early when students face challenges.
          </p>

          <div className="space-y-4 mt-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Activity className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">Activity Score (0-100)</div>
                <div className="text-sm text-muted-foreground">
                  Measures student engagement through document submissions, response times, and platform interactions. 
                  Scores below 40 indicate potential disengagement.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Target className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">Response Time</div>
                <div className="text-sm text-muted-foreground">
                  Average hours taken by students to respond to feedback. High response times (24+ hours) 
                  may indicate confusion or lack of clarity in guidance.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">Submission Rate</div>
                <div className="text-sm text-muted-foreground">
                  Weekly document submission frequency. Consistent submissions (2-3/week) indicate good progress. 
                  Sudden drops may signal obstacles.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interpreting Risk Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border border-green-200 rounded-lg bg-green-50 dark:bg-green-950">
              <div className="font-medium text-green-900 dark:text-green-100">Low Risk</div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Student is progressing well with regular submissions and high engagement. Continue monitoring.
              </div>
            </div>

            <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-950">
              <div className="font-medium text-yellow-900 dark:text-yellow-100">Medium Risk</div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                Some indicators suggest potential issues. Schedule a check-in meeting to assess challenges.
              </div>
            </div>

            <div className="p-3 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950">
              <div className="font-medium text-red-900 dark:text-red-100">High Risk</div>
              <div className="text-sm text-red-700 dark:text-red-300">
                Immediate intervention required. Multiple warning signs detected. Contact student urgently.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/advisor/resources/guide/providing-feedback">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous: Providing Feedback
          </Link>
        </Button>
        <Button asChild>
          <Link href="/advisor/resources/guide/scheduling-meetings">
            Next: Scheduling Meetings
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
