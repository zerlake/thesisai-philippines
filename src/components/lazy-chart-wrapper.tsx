'use client';

import dynamic from 'next/dynamic';
import { ComponentType, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Lazy wrapper for chart components that use recharts
 * This prevents the 283KB recharts library from loading in the main bundle
 */

interface LazyChartWrapperProps {
  Component: ComponentType<any>;
  props: Record<string, any>;
  height?: string;
}

// Create a loading skeleton
const ChartSkeleton = ({ height = 'h-64' }: { height?: string }) => (
  <div className={`w-full ${height} bg-gray-100 rounded-md animate-pulse`}>
    <Skeleton className="w-full h-full" />
  </div>
);

/**
 * Dynamically import chart component with ssr disabled
 * This ensures recharts bundle is code-split
 */
export function LazyChartWrapper({ Component, props, height = 'h-64' }: LazyChartWrapperProps) {
  const DynamicComponent = dynamic(() => Promise.resolve(Component), {
    ssr: false,
    loading: () => <ChartSkeleton height={height} />,
  });

  return (
    <Suspense fallback={<ChartSkeleton height={height} />}>
      <DynamicComponent {...props} />
    </Suspense>
  );
}

/**
 * Higher-order function to create lazy-loaded versions of chart components
 * Usage: const LazyChart = createLazyChart(OriginalChart);
 */
export function createLazyChart<P extends object>(
  Component: ComponentType<P>,
  displayName: string
) {
  const LazyComponent = dynamic(() => Promise.resolve(Component), {
    ssr: false,
    loading: () => <ChartSkeleton />,
  });

  LazyComponent.displayName = `Lazy${displayName}`;

  return LazyComponent;
}
