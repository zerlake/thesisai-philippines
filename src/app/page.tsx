import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { FaqSection } from "@/components/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ThesisStructureSection } from "@/components/thesis-structure-section";
import { AiToolkitSection } from "@/components/ai-toolkit-section";

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground" itemScope itemType="https://schema.org/WebApplication">
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

      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ThesisStructureSection />
        <AiToolkitSection />
        <FaqSection />
      </main>
    </div>
  );
}