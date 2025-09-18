"use client";

import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t bg-card px-6 py-4 text-center text-xs text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} ThesisAI. All rights reserved.</p>
      <p className="mt-1">
        <Link href="/user-guide" className="hover:underline">User Guide</Link>
        <span className="mx-2">•</span>
        <a href="mailto:support@app:thesisai.com?subject=Feedback" className="hover:underline">Provide Feedback</a>
      </p>
    </footer>
  );
}