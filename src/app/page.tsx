import { Suspense } from "react";
import Head from "next/head";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { DeferredSections } from "@/components/landing/deferred-sections";

// Loading skeleton for critical sections with fixed height to prevent CLS
function SectionSkeleton() {
  return (
    <div className="h-[600px] bg-slate-800/30 animate-pulse" />
  );
}

export default function LandingPage() {
  return (
    <div className="bg-slate-900 text-white" itemScope itemType="https://schema.org/WebApplication">
      <meta itemProp="name" content="ThesisAI Philippines" />
      <meta itemProp="description" content="AI-powered academic writing assistant for Philippine students" />
      <meta itemProp="applicationCategory" content="Education" />
      <meta itemProp="operatingSystem" content="Web" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ThesisAI Philippines",
            "url": "https://thesisai-philippines.vercel.app",
            "description": "The leading AI-powered platform for thesis research, manuscript checking, and academic writing automation designed for Philippine universities.",
            "applicationCategory": "WritingTool",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "PHP"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "156"
            },
            "featureList": [
              "AI Thesis Outline Generator",
              "Originality Checker",
              "Citation Management",
              "Advisor Collaboration Tools",
              "University-Specific Formatting Guides"
            ]
          })
        }}
      />

      <main id="main-content">
        <HeroSection />

        {/* Features shown immediately - critical for above-fold engagement */}
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturesSection />
        </Suspense>

        {/* Below-fold sections lazy load from client component */}
        <DeferredSections />
      </main>
    </div>
  );
}