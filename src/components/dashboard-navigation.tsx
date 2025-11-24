"use client";

import { ChevronRight, LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { EnterpriseCard, EnterpriseCardContent } from "./enterprise-card";

interface DashboardNavItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "destructive";
}

interface DashboardNavigationProps {
  items: DashboardNavItem[];
  title?: string;
}

const badgeVariantStyles = {
  default: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  success: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  destructive: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function DashboardNavigation({ items, title = "Quick Tools" }: DashboardNavigationProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Access your most-used research and writing tools
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <EnterpriseCard
                interactive
                variant="outline"
                className="h-full transition-all hover:border-primary/50 hover:bg-card/50"
              >
                <EnterpriseCardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                          badgeVariantStyles[item.badgeVariant || "default"]
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-primary">
                    Open <ChevronRight className="h-3 w-3" />
                  </div>
                </EnterpriseCardContent>
              </EnterpriseCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
