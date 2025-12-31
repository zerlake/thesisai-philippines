import { Suspense } from "react";
import { AsymmetricHeroSectionServer } from "@/components/landing/asymmetric-hero-section-server";
import { FeaturesSectionServer } from "@/components/landing/features-section-server";
import { DeferredSections } from "@/components/landing/deferred-sections";

// Loading skeleton for critical sections with fixed height to prevent CLS
function SectionSkeleton() {
  return (
    <div className="h-[600px] bg-slate-800/30 animate-pulse" />
  );
}

// Server component that renders critical content for SEO
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-dark-bg text-white">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "ThesisAI Philippines",
            "alternateName": "ThesisAI PH",
            "url": "https://thesisai-philippines.vercel.app",
            "description": "AI-powered academic writing assistant for Philippine students. Streamline your thesis writing process with our AI-powered platform. Generate outlines, check originality, format citations, and connect with advisors—all in one workspace.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://thesisai-philippines.vercel.app/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "creator": {
              "@type": "Organization",
              "name": "ThesisAI Philippines"
            },
            "publisher": {
              "@type": "Organization",
              "name": "ThesisAI Philippines",
              "logo": {
                "@type": "ImageObject",
                "url": "https://thesisai-philippines.vercel.app/logo.png"
              }
            },
            "sameAs": [
              "https://facebook.com/thesisai.philippines",
              "https://twitter.com/thesisai_ph",
              "https://linkedin.com/company/thesisai-ph"
            ]
          })
        }}
      />

      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ThesisAI Philippines",
            "legalName": "ThesisAI Philippines Academic Solutions",
            "url": "https://thesisai-philippines.vercel.app",
            "logo": "https://thesisai-philippines.vercel.app/logo.png",
            "foundingDate": "2024",
            "founders": [
              {
                "@type": "Person",
                "name": "ThesisAI Team"
              }
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+63",
              "contactType": "customer service",
              "areaServed": "PH",
              "availableLanguage": "en"
            },
            "sameAs": [
              "https://facebook.com/thesisai.philippines",
              "https://twitter.com/thesisai_ph",
              "https://linkedin.com/company/thesisai-ph"
            ],
            "description": "AI-powered academic writing assistant for Philippine students and researchers",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "PH"
            }
          })
        }}
      />

      <main id="main-content">
        <AsymmetricHeroSectionServer />

        {/* Server-rendered features section for SEO - critical content rendered immediately */}
        <FeaturesSectionServer />

        {/* Below-fold sections lazy load from client component */}
        <DeferredSections />
      </main>
    </div>
  );
}