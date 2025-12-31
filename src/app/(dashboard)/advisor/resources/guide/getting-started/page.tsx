"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Play, CheckCircle, Users, BarChart, Calendar } from "lucide-react";
import Link from "next/link";

export default function GettingStartedPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Getting Started</h1>
        <p className="text-muted-foreground">
          Introduction to the advisor dashboard and key features
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-blue-500" />
            Welcome to the Advisor Dashboard
          </CardTitle>
          <CardDescription>Your central hub for managing thesis students</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The Advisor Dashboard provides you with comprehensive tools to guide your students through their thesis journey. 
            This platform helps you track progress, provide timely feedback, and ensure academic excellence.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Users className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">Student Management</div>
                <div className="text-sm text-muted-foreground">
                  Track all your assigned students in one place. Monitor their progress, view thesis details, 
                  and identify students who need additional support.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <BarChart className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">Performance Analytics</div>
                <div className="text-sm text-muted-foreground">
                  Use AI-powered analytics to identify at-risk students early, track submission patterns, 
                  and measure engagement levels.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Calendar className="h-6 w-6 text-purple-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">Meeting Scheduler</div>
                <div className="text-sm text-muted-foreground">
                  Coordinate advisory meetings, track attendance, and maintain detailed consultation records.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-6 w-6 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">Feedback & Review Tools</div>
                <div className="text-sm text-muted-foreground">
                  Streamline your review process with templates, rubrics, and quality assurance tools.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start Checklist</CardTitle>
          <CardDescription>Complete these steps to set up your workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-green-900 dark:text-green-100">Review your assigned students</span>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span>Set up feedback templates</span>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span>Configure meeting availability</span>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span>Explore analytics dashboard</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/advisor/resources/guide/student-management">
            Next: Student Management
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/advisor">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
