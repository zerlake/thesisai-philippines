"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { useAuth } from "./auth-provider";
import { studentNavGroups, adminNavItems, advisorNavGroups, criticNavGroups, type NavItem, type NavGroup } from "../lib/navigation";
import { ScrollArea } from "./ui/scroll-area";

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const renderNavGroup = (group: NavGroup) => (
    <div key={group.title}>
      <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {group.title}
      </h3>
      {group.items.map((item: NavItem) => (
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

  const renderNav = () => {
    switch (profile?.role) {
      case "admin":
        return (
          <div className="mb-4">
            <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </h3>
            {adminNavItems.map((item: NavItem) => (
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