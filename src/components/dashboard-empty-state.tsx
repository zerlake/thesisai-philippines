"use client";

import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center space-y-4 max-w-md">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="bg-blue-100 p-4 rounded-full">
            <FileText className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Main CTA */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Start Your Thesis</h2>
          <p className="text-muted-foreground text-lg">
            Create your first document to begin writing with AI assistance
          </p>
        </div>

        {/* Primary Action */}
        <Link href="/new-document">
          <Button size="lg" className="w-full sm:w-auto">
            <FileText className="w-5 h-5 mr-2" />
            Create Document
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>

        {/* Secondary Action */}
        <Link href="/templates">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Browse Templates
          </Button>
        </Link>

        {/* Features List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mt-6 pt-4 border-t">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-green-600 font-bold">✓</div>
            <div>
              <p className="text-sm font-medium">AI-Powered Writing</p>
              <p className="text-xs text-muted-foreground">Get suggestions and guidance</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-green-600 font-bold">✓</div>
            <div>
              <p className="text-sm font-medium">Smart Collaboration</p>
              <p className="text-xs text-muted-foreground">Invite advisors and critics</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-green-600 font-bold">✓</div>
            <div>
              <p className="text-sm font-medium">Format Templates</p>
              <p className="text-xs text-muted-foreground">Built for Philippine institutions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-green-600 font-bold">✓</div>
            <div>
              <p className="text-sm font-medium">Real-time Feedback</p>
              <p className="text-xs text-muted-foreground">Grammar & structure checks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
