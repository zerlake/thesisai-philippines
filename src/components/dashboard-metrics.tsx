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
import { getMockDataEnabled } from "@/lib/mock-referral-data";

interface MetricsGridProps {
  docCount: number;
  wordCount: number;
  avgWordCount: number;
  recentWordCount: number;
  isLoading: boolean;
  useMockData?: boolean;
  onToggleMockData?: () => void;
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
  useMockData: propUseMockData,
  onToggleMockData,
}: MetricsGridProps) {
  // Use mock data if enabled
  const useMockData = propUseMockData !== undefined ? propUseMockData : getMockDataEnabled();

  // Mock data for development/testing
  const mockMetrics = {
    docCount: 12,
    wordCount: 15420,
    avgWordCount: 1285,
    recentWordCount: 2450
  };

  // Use mock data if enabled, otherwise use real data
  const displayMetrics = useMockData ? mockMetrics : {
    docCount,
    wordCount,
    avgWordCount,
    recentWordCount
  };

  if (isLoading && !useMockData) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const wordCountTrend = displayMetrics.recentWordCount > 0 ? Math.round((displayMetrics.recentWordCount / (displayMetrics.wordCount / 52)) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">Project Metrics</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your thesis writing progress
            {useMockData && <span className="ml-2 text-xs text-amber-600">(using mock data)</span>}
          </p>
        </div>
        {onToggleMockData && (
          <button
            onClick={onToggleMockData}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-colors whitespace-nowrap ${useMockData ? 'bg-amber-100 border-amber-500 text-amber-800 hover:bg-amber-200' : 'bg-green-100 border-green-500 text-green-800 hover:bg-green-200'}`}
            title={useMockData ? 'Disable mock data' : 'Enable mock data'}
          >
            <svg className={`w-5 h-5 ${useMockData ? 'text-amber-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              {useMockData ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            <span className="text-sm font-semibold">
              {useMockData ? 'Mock Data' : 'Live Data'}
            </span>
          </button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricItem
          icon={<FileText className="h-5 w-5" />}
          label="Total Documents"
          value={displayMetrics.docCount}
          subtext={displayMetrics.docCount === 1 ? "1 document" : `${displayMetrics.docCount} documents`}
          color="blue"
        />
        <MetricItem
          icon={<BookOpenCheck className="h-5 w-5" />}
          label="Total Words"
          value={displayMetrics.wordCount.toLocaleString()}
          subtext={`+${displayMetrics.recentWordCount.toLocaleString()} last 7 days`}
          trend={wordCountTrend}
          color="green"
        />
        <MetricItem
          icon={<Baseline className="h-5 w-5" />}
          label="Avg. Words/Doc"
          value={displayMetrics.avgWordCount.toLocaleString()}
          subtext="Per document average"
          color="purple"
        />
        <MetricItem
          icon={<Clock className="h-5 w-5" />}
          label="Recent Activity"
          value={displayMetrics.recentWordCount.toLocaleString()}
          subtext="Words in last 7 days"
          color="orange"
        />
      </div>
    </div>
  );
}
