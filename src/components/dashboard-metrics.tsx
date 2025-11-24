"use client";

import {
  FileText,
  BookOpenCheck,
  Baseline,
  TrendingUp,
  Clock,
} from "lucide-react";
import { EnterpriseCard, EnterpriseCardContent } from "./enterprise-card";
import { Skeleton } from "./ui/skeleton";

interface MetricsGridProps {
  docCount: number;
  wordCount: number;
  avgWordCount: number;
  recentWordCount: number;
  isLoading: boolean;
}

interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: number;
  color: "blue" | "green" | "purple" | "orange" | "red";
}

const MetricItem = ({ icon, label, value, subtext, trend, color }: MetricItemProps) => {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
    red: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  };

  return (
    <EnterpriseCard variant="outline" className="overflow-hidden">
      <EnterpriseCardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <div className={`rounded-lg p-2.5 ${colorStyles[color]}`}>
            {icon}
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
              <TrendingUp className="h-3 w-3" />
              {trend > 0 ? "+" : ""}{trend}%
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <div className="mt-1.5">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
          </div>
        </div>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
};

export function DashboardMetrics({
  docCount,
  wordCount,
  avgWordCount,
  recentWordCount,
  isLoading,
}: MetricsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const wordCountTrend = recentWordCount > 0 ? Math.round((recentWordCount / (wordCount / 52)) * 100) : 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Project Metrics</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your thesis writing progress
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricItem
          icon={<FileText className="h-5 w-5" />}
          label="Total Documents"
          value={docCount}
          subtext={docCount === 1 ? "1 document" : `${docCount} documents`}
          color="blue"
        />
        <MetricItem
          icon={<BookOpenCheck className="h-5 w-5" />}
          label="Total Words"
          value={wordCount.toLocaleString()}
          subtext={`+${recentWordCount.toLocaleString()} last 7 days`}
          trend={wordCountTrend}
          color="green"
        />
        <MetricItem
          icon={<Baseline className="h-5 w-5" />}
          label="Avg. Words/Doc"
          value={avgWordCount.toLocaleString()}
          subtext="Per document average"
          color="purple"
        />
        <MetricItem
          icon={<Clock className="h-5 w-5" />}
          label="Recent Activity"
          value={recentWordCount.toLocaleString()}
          subtext="Words in last 7 days"
          color="orange"
        />
      </div>
    </div>
  );
}
