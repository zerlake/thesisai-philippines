"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookUser, ChevronRight } from "lucide-react";
import Link from "next/link";

const sections = [
  { title: "Getting Started", description: "Introduction to the advisor dashboard and key features", href: "/advisor/resources/guide/getting-started" },
  { title: "Student Management", description: "How to manage and track student progress effectively", href: "/advisor/resources/guide/student-management" },
  { title: "Providing Feedback", description: "Best practices for constructive thesis feedback", href: "/advisor/resources/guide/providing-feedback" },
  { title: "Using Analytics", description: "Understanding performance metrics and reports", href: "/advisor/resources/guide/using-analytics" },
  { title: "Scheduling Meetings", description: "Managing appointments and consultations", href: "/advisor/resources/guide/scheduling-meetings" },
  { title: "Defense Preparation", description: "Guiding students through the defense process", href: "/advisor/resources/guide/defense-preparation" },
];

export default function AdvisorGuidePage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advisor Guide</h1>
        <p className="text-muted-foreground">Comprehensive guide for thesis advisors</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookUser className="h-5 w-5" />Guide Sections</CardTitle>
          <CardDescription>Select a topic to learn more</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {sections.map((section, i) => (
              <Link key={i} href={section.href} className="flex items-center justify-between py-4 hover:bg-muted/50 px-2 rounded-lg transition-colors">
                <div>
                  <div className="font-medium">{section.title}</div>
                  <div className="text-sm text-muted-foreground">{section.description}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
