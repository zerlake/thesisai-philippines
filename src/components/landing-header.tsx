"use client";

import Link from "next/link";
import { BotMessageSquare, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { useAuth } from "./auth-provider";
import { useState } from "react";

export function LandingHeader() {
  const { session } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="px-4 lg:px-8 h-16 flex items-center border-b border-slate-700/50 sticky top-0 bg-slate-900/95 backdrop-blur-md z-50 shadow-lg">
      <Link href="/" className="flex items-center justify-center mr-auto group" aria-label="ThesisAI Philippines homepage">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
          <BotMessageSquare className="h-5 w-5 text-white" />
        </div>
        <span className="ml-3 font-bold text-white text-lg hidden sm:inline">ThesisAI</span>
      </Link>
      
      <nav className="hidden lg:flex gap-1 items-center ml-8">
        {[
          { href: "/features", label: "Features" },
          { href: "/pricing", label: "Pricing" },
          { href: "/for-advisors", label: "For Advisors" },
          { href: "/for-critics", label: "For Critics" },
          { href: "/faq", label: "Help" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-md transition-all motion-safe:duration-200"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        {session ? (
          <UserNav />
        ) : (
          <>
            <Button variant="ghost" asChild className="hidden sm:inline-flex text-slate-300 hover:text-white hover:bg-slate-800">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              <Link href="/register">Get Started</Link>
            </Button>
          </>
        )}
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">{mobileMenuOpen ? "Close menu" : "Open menu"}</span>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-slate-900 border-b border-slate-700/50 py-4 px-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            {[
              { href: "/features", label: "Features" },
              { href: "/pricing", label: "Pricing" },
              { href: "/for-advisors", label: "For Advisors" },
              { href: "/for-critics", label: "For Critics" },
              { href: "/faq", label: "Help" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}