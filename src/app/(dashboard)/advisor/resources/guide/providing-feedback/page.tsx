"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, ThumbsUp, AlertCircle, CheckCircle2, Star, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ProvidingFeedbackGuidePage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Providing Feedback</h1>
        <p className="text-muted-foreground">
          Best practices for constructive thesis feedback
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Principles of Effective Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <ThumbsUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-blue-900 dark:text-blue-100">Be Specific and Actionable</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Instead of "needs improvement," provide concrete suggestions like "expand the literature review 
                  to include studies from 2023-2024 focusing on machine learning applications."
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-950">
              <Star className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-green-900 dark:text-green-100">Balance Critique with Encouragement</div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Acknowledge strengths before addressing weaknesses. For example: "Your methodology is well-structured. 
                  Consider strengthening the theoretical framework by..."
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg bg-purple-50 dark:bg-purple-950">
              <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-purple-900 dark:text-purple-100">Prioritize Critical Issues</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  Focus on major conceptual issues first, then address formatting and minor edits. 
                  Use priority badges: <Badge variant="destructive" className="mx-1">Critical</Badge> 
                  <Badge className="bg-yellow-500 mx-1">Important</Badge> 
                  <Badge variant="outline" className="mx-1">Minor</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Using Feedback Templates</CardTitle>
          <CardDescription>Save time with pre-configured feedback templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            Navigate to <strong>Feedback Templates</strong> to access common feedback scenarios:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
            <li>Methodology improvement suggestions</li>
            <li>Literature review expansion prompts</li>
            <li>Data analysis recommendations</li>
            <li>Writing clarity enhancements</li>
            <li>Citation and formatting corrections</li>
          </ul>
          <Button variant="outline" size="sm" asChild className="mt-3">
            <Link href="/advisor/feedback/templates">View Templates</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback Delivery Timeline</CardTitle>
          <CardDescription>Recommended response times for different submission types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span>Proposal drafts</span>
              <Badge>3-5 business days</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span>Chapter submissions</span>
              <Badge>5-7 business days</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span>Minor revisions</span>
              <Badge>1-2 business days</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span>Final manuscript</span>
              <Badge>7-10 business days</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/advisor/resources/guide/student-management">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous: Student Management
          </Link>
        </Button>
        <Button asChild>
          <Link href="/advisor/resources/guide/using-analytics">
            Next: Using Analytics
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
