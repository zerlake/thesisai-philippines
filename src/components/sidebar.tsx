"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import {
  studentNavGroups,
  adminNavGroups,
  advisorNavGroups,
  criticNavGroups
} from "@/lib/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  // Define renderNavGroup function first
  const renderNavGroup = (group: { title: string; items: { icon: any; label: string; href: string }[] }) => (
    <div key={group.title}>
      <h3 className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground bg-muted rounded-md mb-1">
        {group.title}
      </h3>
      {group.items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            pathname === item.href && "bg-accent text-accent-foreground"
          )}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );

  // Determine which navigation to show based on current path and role
  const renderNav = () => {
    const isAdmin = profile?.role === "admin";

    // For admin users, show context-aware navigation based on current path
    if (isAdmin) {
      // Show appropriate nav based on which dashboard admin is viewing
      if (pathname.startsWith("/advisor")) {
        return advisorNavGroups.map(renderNavGroup);
      } else if (pathname.startsWith("/critic")) {
        return criticNavGroups.map(renderNavGroup);
      } else if (pathname.startsWith("/dashboard") || pathname.startsWith("/topic-ideas") ||
                 pathname.startsWith("/research") || pathname.startsWith("/papers") ||
                 pathname.startsWith("/references") || pathname.startsWith("/drafts") ||
                 pathname.startsWith("/outline") || pathname.startsWith("/literature-review") ||
                 pathname.startsWith("/methodology") || pathname.startsWith("/chat") ||
                 pathname.startsWith("/projects") || pathname.startsWith("/ai-usage")) {
        // Student-related pages
        return studentNavGroups.map(renderNavGroup);
      } else {
        // Default to admin navigation for /admin paths
        return adminNavGroups.map(renderNavGroup);
      }
    }

    // For non-admin users, show their role-specific navigation
    switch (profile?.role) {
      case "advisor":
        return advisorNavGroups.map(renderNavGroup);
      case "critic":
        return criticNavGroups.map(renderNavGroup);
      default:
        return studentNavGroups.map(renderNavGroup);
    }
  };

  return (
    <aside className="hidden h-full w-64 flex-col border-r border-slate-700 bg-card/50 backdrop-blur-sm md:flex">
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {renderNav()}
        </nav>
      </ScrollArea>
    </aside>
  );
}