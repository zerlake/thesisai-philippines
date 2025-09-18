"use client";

import Link from "next/link";
import { BotMessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { useAuth } from "./auth-provider";

export function LandingHeader() {
  const { session } = useAuth();

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b border-slate-700 sticky top-0 bg-slate-900/80 backdrop-blur-sm z-50">
      <Link href="/" className="flex items-center justify-center mr-auto">
        <BotMessageSquare className="h-6 w-6 text-white" />
        <span className="ml-2 font-bold text-white">ThesisAI</span>
      </Link>
      <nav className="hidden md:flex gap-4 sm:gap-6 items-center">
        <Link
          href="/features"
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          Features
        </Link>
        <Link
          href="/pricing"
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          Pricing
        </Link>
        <Link
          href="/for-advisors"
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          For Advisors
        </Link>
        <Link
          href="/faq"
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          FAQ
        </Link>
      </nav>
      <div className="ml-auto flex items-center gap-4">
        {session ? (
          <UserNav />
        ) : (
          <>
            <Button variant="ghost" asChild className="text-slate-300 hover:text-white hover:bg-slate-800">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all">
              <Link href="/register">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}