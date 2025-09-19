"use client";

import Link from "next/link";
import { useAuth } from "./auth-provider";

export function AppFooter() {
  const { profile } = useAuth();

  const guideLink = () => {
    switch (profile?.role) {
      case "advisor":
        return "/advisor-guide";
      case "critic":
        return "/critic-guide";
      default:
        return "/user-guide";
    }
  };

  return (
    <footer className="border-t border-slate-700 bg-card/50 backdrop-blur-sm px-6 py-4 text-center text-xs text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} ThesisAI. All rights reserved.</p>
      <p className="mt-1">
        <Link href={guideLink()} className="hover:underline">User Guide</Link>
        <span className="mx-2">•</span>
        <a href="mailto:support@app:thesisai.com?subject=Feedback" className="hover:underline">Provide Feedback</a>
      </p>
    </footer>
  );
}