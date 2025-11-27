'use client';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-9 bg-gray-200 rounded w-1/4 mb-3" />
        <div className="h-5 bg-gray-200 rounded w-1/2" />
      </div>

      {/* Widgets grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-lg border border-gray-200 space-y-4"
          >
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WidgetSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/2" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3" />
      <div className="h-48 bg-gray-200 rounded" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/2" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  );
}
