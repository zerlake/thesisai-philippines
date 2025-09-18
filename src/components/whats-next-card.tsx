"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../lib/utils";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

type Action = {
  type: 'feedback' | 'milestone' | 'task';
  title: string;
  detail: string;
  urgency: 'critical' | 'high' | 'normal';
  href: string;
  icon: LucideIcon;
};

interface WhatsNextCardProps {
  nextAction: Action | null;
  isLoading: boolean;
}

export function WhatsNextCard({ nextAction, isLoading }: WhatsNextCardProps) {
  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!nextAction) {
    return null; // Don't show the card if there's nothing to do
  }

  const urgencyClasses = {
    critical: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300",
    high: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300",
    normal: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300",
  };

  const Icon = nextAction.icon;

  return (
    <Card className={cn("border-2", urgencyClasses[nextAction.urgency])}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Icon className="w-6 h-6" />
          <span>What's Next?</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-xl font-bold">{nextAction.title}</h3>
        <p className="text-sm opacity-80 mt-1">{nextAction.detail}</p>
        <Link href={nextAction.href}>
          <Button className="mt-4">
            Start Now <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}