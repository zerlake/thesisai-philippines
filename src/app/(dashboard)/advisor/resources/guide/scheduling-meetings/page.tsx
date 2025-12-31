"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Video, MapPin, Bell, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function SchedulingMeetingsGuidePage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Scheduling Meetings</h1>
        <p className="text-muted-foreground">
          Managing appointments and consultations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meeting Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Advisory Meetings
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Regular check-ins to discuss progress, address concerns, and plan next steps. 
                Recommended: Every 2 weeks, 30-60 minutes.
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="font-medium flex items-center gap-2">
                <Video className="h-4 w-4 text-green-500" />
                Virtual Consultations
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Quick online sessions for urgent questions or quick clarifications. 
                Recommended: 15-30 minutes as needed.
              </div>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-500" />
                Proposal/Defense Reviews
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Formal sessions to review proposals or prepare for defenses. 
                Recommended: 60-90 minutes, scheduled well in advance.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 ml-2">
            <li>Set clear agendas before each meeting</li>
            <li>Allow students to prepare questions in advance</li>
            <li>Document key decisions and action items</li>
            <li>Send meeting summaries within 24 hours</li>
            <li>Be punctual and respect scheduled times</li>
            <li>Use the Appointment Scheduler tool to avoid conflicts</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meeting Preparation Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Review student's latest submissions</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Check progress against timeline</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Prepare specific feedback points</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Have resources ready to share</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/advisor/resources/guide/using-analytics">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous: Using Analytics
          </Link>
        </Button>
        <Button asChild>
          <Link href="/advisor/resources/guide/defense-preparation">
            Next: Defense Preparation
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
