"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, CheckCircle, Users, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function DefensePreparationGuidePage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Defense Preparation</h1>
        <p className="text-muted-foreground">
          Guiding students through the defense process
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Defense Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950 rounded">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-blue-900 dark:text-blue-100">4-6 Weeks Before</div>
                <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 mt-1 ml-2 space-y-1">
                  <li>Complete final manuscript review</li>
                  <li>Ensure all revisions are addressed</li>
                  <li>Submit to panel members</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950 rounded">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-green-900 dark:text-green-100">2-3 Weeks Before</div>
                <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-300 mt-1 ml-2 space-y-1">
                  <li>Conduct mock defense sessions</li>
                  <li>Review potential panel questions</li>
                  <li>Refine presentation slides</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-950 rounded">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-purple-900 dark:text-purple-100">1 Week Before</div>
                <ul className="list-disc list-inside text-sm text-purple-700 dark:text-purple-300 mt-1 ml-2 space-y-1">
                  <li>Final presentation practice</li>
                  <li>Prepare defense materials</li>
                  <li>Confirm logistics and requirements</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Defense Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Prepare students for these typical panel questions:</p>
          <ul className="list-disc list-inside text-sm space-y-2 ml-2">
            <li>What motivated you to choose this research topic?</li>
            <li>What are the limitations of your study?</li>
            <li>How does your research contribute to the field?</li>
            <li>What were your most significant findings?</li>
            <li>What would you do differently if you could start over?</li>
            <li>What are the implications of your research?</li>
            <li>How did you address validity and reliability?</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Role During Defense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Before:</strong> Ensure student is well-prepared and confident
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>During:</strong> Provide support and clarify misunderstandings when appropriate
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>After:</strong> Debrief with student, discuss panel feedback and next steps
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/advisor/resources/guide/scheduling-meetings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous: Scheduling Meetings
          </Link>
        </Button>
        <Button asChild>
          <Link href="/advisor/resources/guide">
            Back to Guide Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
