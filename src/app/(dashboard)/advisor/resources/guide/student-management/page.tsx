"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Target, AlertTriangle, BookOpen, Eye, MessageCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function StudentManagementGuidePage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
        <p className="text-muted-foreground">
          How to manage and track student progress effectively
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Effective student management is crucial for successful thesis supervision. The platform provides 
            tools to monitor progress, identify challenges early, and provide timely interventions.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Managing Your Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Viewing Student List
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Access your complete student roster from the "My Students" section. Each student card displays:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>Current thesis progress percentage</li>
                <li>Status indicators (On Track, At Risk, Needs Attention)</li>
                <li>Next milestone deadline</li>
                <li>Last activity timestamp</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Tracking Progress
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Monitor student advancement through their thesis phases:
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Proposal</Badge>
                <Badge className="bg-blue-100 text-blue-800">Research</Badge>
                <Badge className="bg-purple-100 text-purple-800">Writing</Badge>
                <Badge className="bg-green-100 text-green-800">Defense</Badge>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Identifying At-Risk Students
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                The system automatically flags students who may need additional support based on:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>Delayed responses to feedback (24+ hours)</li>
                <li>Low submission frequency (less than 1 per week)</li>
                <li>Declining activity scores</li>
                <li>Missed milestones</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-500" />
                Student Detail View
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Click on any student to access their comprehensive profile including:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>Complete thesis information and abstract</li>
                <li>Document submission history</li>
                <li>Feedback exchange timeline</li>
                <li>Performance metrics and analytics</li>
                <li>Meeting notes and schedules</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-orange-500" />
                Communication Best Practices
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Maintain regular contact with your students:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>Respond to questions within 24-48 hours</li>
                <li>Schedule regular check-in meetings (biweekly recommended)</li>
                <li>Use the messaging system for quick updates</li>
                <li>Provide constructive, actionable feedback</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/advisor/resources/guide/getting-started">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous: Getting Started
          </Link>
        </Button>
        <Button asChild>
          <Link href="/advisor/resources/guide/providing-feedback">
            Next: Providing Feedback
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
