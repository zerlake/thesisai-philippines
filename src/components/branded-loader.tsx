"use client";

import { BookText } from "lucide-react";

export function BrandedLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex items-center gap-3 text-primary animate-pulse">
        <BookText className="w-10 h-10" />
        <span className="text-2xl font-semibold">ThesisAI</span>
      </div>
      <p className="text-muted-foreground mt-2">Loading your workspace...</p>
    </div>
  );
}