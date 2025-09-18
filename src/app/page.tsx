import { LandingHeader } from "@/components/landing-header";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { FaqSection } from "@/components/faq-section";
import { LandingFooter } from "@/components/landing-footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}