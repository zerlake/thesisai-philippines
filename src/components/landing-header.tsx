import Link from "next/link";
import { BotMessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/95 backdrop-blur z-10">
      <Link href="/" className="flex items-center justify-center mr-auto">
        <BotMessageSquare className="h-6 w-6" />
        <span className="ml-2 font-bold">ThesisAI</span>
      </Link>
      <nav className="hidden md:flex gap-4 sm:gap-6 items-center">
        <Link
          href="/features"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          Features
        </Link>
        <Link
          href="/for-advisors"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          For Advisors
        </Link>
        <Link
          href="/pricing"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          Pricing
        </Link>
        <Link
          href="/faq"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          FAQ
        </Link>
      </nav>
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    </header>
  );
}