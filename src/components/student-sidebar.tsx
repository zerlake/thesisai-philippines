"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileUp, MessageSquareQuote, BotMessageSquare, FlaskConical, BarChart3, BookOpen, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export function StudentSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/student/dashboard", label: "Dashboard", icon: Home },
    { href: "#", label: "My Submissions", icon: FileUp },
    { href: "#", label: "Feedback", icon: MessageSquareQuote },
  ];

  const toolItems = [
    { href: "/student/methodology", label: "Methodology Helper", icon: FlaskConical },
    { href: "/student/results", label: "Results Helper", icon: BarChart3 },
    { href: "/student/conclusion", label: "Conclusion Helper", icon: Lightbulb },
    { href: "/student/resources", label: "Resources", icon: BookOpen },
  ];

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BotMessageSquare className="h-6 w-6" />
            <span className="">ThesisAI</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === item.href && "bg-muted text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            
            <div className="my-2">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Writing Tools</h3>
            </div>

            {toolItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname.startsWith(item.href) && "bg-muted text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}