import Link from "next/link";
import { BotMessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export function LandingHeader() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b sticky top-0 bg-background/95 backdrop-blur z-10">
      <Link href="/" className="flex items-center justify-center mr-6">
        <BotMessageSquare className="h-6 w-6" />
        <span className="ml-2 font-bold">ThesisAI</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Link
          href="#features"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          Features
        </Link>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Login</Link>
        </Button>
        <ThemeToggle />
      </nav>
    </header>
  );
}