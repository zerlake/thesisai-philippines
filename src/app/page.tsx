import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { FaqSection } from "@/components/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ThesisStructureSection } from "@/components/thesis-structure-section";
import { AiToolkitSection } from "@/components/ai-toolkit-section";

export default function LandingPage() {
  return (
    <div className="bg-slate-900 text-white">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ThesisStructureSection />
      <AiToolkitSection />
      <FaqSection />
    </div>
  );
}