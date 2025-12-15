"use client";

import { WikiViewer } from "@/components/admin/wiki-viewer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function AdminWikiPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Code Wiki</h1>
          <p className="text-muted-foreground">
            Central knowledge base with documentation, guides, and best practices
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <WikiViewer />
    </div>
  );
}
