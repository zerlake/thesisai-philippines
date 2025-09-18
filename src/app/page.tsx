import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { WritingToolsSection } from "@/components/writing-tools-section";
import { FaqSection } from "@/components/faq-section";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <WritingToolsSection />
      <FaqSection />
    </>
  );
}