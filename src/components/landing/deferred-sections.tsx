'use client';

import dynamic from "next/dynamic";

// Loading skeleton for deferred sections with explicit dimensions to prevent CLS
function SectionSkeleton() {
  return (
    <div className="h-[600px] bg-slate-800/30 animate-pulse" />
  );
}

// Below-fold sections - lazy load with dynamic imports in client component
// Using ssr: false to avoid rendering on server and reduce bundle size
const HowItWorksSection = dynamic(
  () => import("@/components/landing/how-it-works-section-updated").then(mod => ({ default: mod.HowItWorksSection })),
  {
    loading: () => <SectionSkeleton />,
    ssr: false
  }
);

const AiToolkitSection = dynamic(
  () => import("@/components/landing/ai-toolkit-section").then(mod => ({ default: mod.AiToolkitSection })),
  {
    loading: () => <SectionSkeleton />,
    ssr: false
  }
);

const FaqSection = dynamic(
  () => import("@/components/landing/faq-section").then(mod => ({ default: mod.FaqSection })),
  {
    loading: () => <SectionSkeleton />,
    ssr: false
  }
);

export function DeferredSections() {
  return (
    <div className="opacity-0 animate-[fade-in_0.5s_ease-out_0.4s_forwards]">
      {/* Below-fold sections lazy load - removed Suspense to use dynamic's loading state */}
      <HowItWorksSection />
      <AiToolkitSection />
      <FaqSection />
    </div>
  );
}
