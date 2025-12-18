/**
 * Code Splitting Examples and Best Practices
 * Demonstrates how to optimize large components
 */

'use client';

import dynamic from 'next/dynamic';
import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Example 1: Lazy Load Dashboard Based on User Role
 */
const StudentDashboard = dynamic(
  () => import('@/components/student-dashboard-enterprise').then(mod => ({ default: mod.StudentDashboardEnterprise })),
  {
    loading: () => <DashboardSkeleton />,
    ssr: true, // Enable SSR for SEO
  }
);

/**
 * Example 1: Dashboard Selector
 * Only loads the dashboard for the current user role
 */
export function DashboardSelector({ 
  role,
  userId 
}: { 
  role: 'student' | 'admin' | 'advisor'; 
  userId: string;
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {role === 'student' && <StudentDashboardEnterprise key={userId} />}
    </Suspense>
  );
}

/**
 * Example 2: Modal Content
 */
export function UserMenu() {
  const [openModal, setOpenModal] = useState<'profile' | 'settings' | null>(null);

  return (
    <div>
      <button onClick={() => setOpenModal('profile')}>Edit Profile</button>
      <button onClick={() => setOpenModal('settings')}>Settings</button>

      {openModal === 'profile' && (
        <div className="p-4">Profile modal would load here</div>
      )}

      {openModal === 'settings' && (
        <div className="p-4">Settings modal would load here</div>
      )}
    </div>
  );
}

/**
 * Example 3: Lazy Load Data Visualization
 * Charts are heavy - load only when needed
 */
interface TabContentProps {
  tab: 'analytics' | 'gaps' | 'overview';
}

export function AnalyticsTabs({ tab }: TabContentProps) {
  return (
    <div>
      {tab === 'analytics' && (
        <Suspense fallback={<Skeleton className="w-full h-80" />}>
          <div className="w-full h-80 bg-gray-100">Analytics Chart</div>
        </Suspense>
      )}

      {tab === 'gaps' && (
        <Suspense fallback={<Skeleton className="w-full h-96" />}>
          <div className="w-full h-96 bg-gray-100">Research Gap Visualizer</div>
        </Suspense>
      )}

      {tab === 'overview' && (
        <div>Overview content here</div>
      )}
    </div>
  );
}

/**
 * Example 4: Progressive Enhancement - Load Features on Demand
 */
export function ToolsLibrary() {
  const [activeTools, setActiveTools] = useState<Set<string>>(new Set());

  const toggleTool = (toolId: string) => {
    const newTools = new Set(activeTools);
    if (newTools.has(toolId)) {
      newTools.delete(toolId);
    } else {
      newTools.add(toolId);
    }
    setActiveTools(newTools);
  };

  return (
    <div className="space-y-4">
      <button onClick={() => toggleTool('stats')}>Statistics Tool</button>
      <button onClick={() => toggleTool('literature')}>Literature Review</button>
      <button onClick={() => toggleTool('methodology')}>Methodology Guide</button>

      <div className="space-y-4">
        {activeTools.has('stats') && (
          <Suspense fallback={<Skeleton className="w-full h-96" />}>
            <div className="p-4 bg-gray-50">Statistical Analysis Tool</div>
          </Suspense>
        )}

        {activeTools.has('literature') && (
          <Suspense fallback={<Skeleton className="w-full h-96" />}>
            <div className="p-4 bg-gray-50">Literature Review Tool</div>
          </Suspense>
        )}

        {activeTools.has('methodology') && (
          <Suspense fallback={<Skeleton className="w-full h-96" />}>
            <div className="p-4 bg-gray-50">Methodology Guide</div>
          </Suspense>
        )}
      </div>
    </div>
  );
}

/**
 * Example 5: Smart Lazy Loading with Intersection Observer
 */
interface LazyComponentProps {
  component: React.ComponentType<any>;
  fallback: React.ReactNode;
  props?: any;
}

export function LazyComponent({
  component: Component,
  fallback,
  props = {},
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? (
        <Suspense fallback={fallback}>
          <Component {...props} />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}

/**
 * Helper: Dashboard Skeleton Loader
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

/**
 * Best Practices Summary:
 *
 * 1. Use dynamic() for heavy components
 * 2. Provide loading states (Skeleton, Spinner)
 * 3. Set ssr: false for components without SSR value
 * 4. Load on demand, not on page load
 * 5. Use Suspense boundaries
 * 6. Add error boundaries for failed imports
 * 7. Key components with unique IDs for re-renders
 * 8. Monitor bundle size with ANALYZE=true npm run build
 */
