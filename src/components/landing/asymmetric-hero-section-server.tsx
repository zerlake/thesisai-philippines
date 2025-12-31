import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { ArrowRight, Sparkles, Target, Lightbulb, BookOpen, Network, FileText, FlaskConical } from "lucide-react";

// Server component for hero section with critical content rendered server-side
export function AsymmetricHeroSectionServer() {
  // Static hero data that will be rendered server-side
  const heroData = {
    title: "Your Thesis, Perfected",
    subtitle: "From research conceptualization to final defense, ThesisAI provides enterprise-grade tools to streamline every stage of your academic journey.",
    ctaText: "Get Started Free",
    ctaHref: "/register",
    secondaryCtaText: "Explore Features",
    secondaryCtaHref: "#features",
    trustStatement: "🚀 Ready to elevate your thesis? Join thousands of Filipino students and researchers using ThesisAI.",
    features: [
      {
        id: "feature-1",
        icon: "Target",
        title: "Research Conceptualization",
        description: "Variable Mapping Tool and Research Problem Identifier with Philippine-specific data"
      },
      {
        id: "feature-2",
        icon: "Lightbulb",
        title: "AI Idea Generation",
        description: "Generate research questions, topic ideas, and chapter outlines tailored to your field"
      },
      {
        id: "feature-3",
        icon: "BookOpen",
        title: "Collaborative Literature Review",
        description: "Annotate, tag, and analyze literature together with real-time collaboration"
      }
    ]
  };

  // Helper function to get icon component by name
  const getIconComponent = (iconName: string) => {
    switch(iconName) {
      case 'Target': return <Target className="h-6 w-6" />;
      case 'Lightbulb': return <Lightbulb className="h-6 w-6" />;
      case 'BookOpen': return <BookOpen className="h-6 w-6" />;
      case 'Network': return <Network className="h-6 w-6" />;
      case 'FileText': return <FileText className="h-6 w-6" />;
      case 'FlaskConical': return <FlaskConical className="h-6 w-6" />;
      default: return <Sparkles className="h-6 w-6" />;
    }
  };

  return (
    <section 
      className="relative overflow-hidden"
      aria-labelledby="hero-title"
      itemScope
      itemType="https://schema.org/WebPage"
    >
      <meta itemProp="name" content="ThesisAI Philippines - Academic Writing Assistant" />
      <meta itemProp="description" content="AI-powered academic writing assistant for Philippine students" />
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/HERO_IMAGE.png"
          alt="Academic research and writing background"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/75 to-slate-800/90" />
      </div>

      {/* Animated Background Elements - Static for SSR */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent-electric-purple/10 rounded-full blur-3xl z-[1]" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl z-[1]" />

      {/* Content Container */}
      <div className="relative z-10 container flex flex-col lg:flex-row items-center justify-between gap-12 pt-16 pb-32">
        {/* Left Content (60% on desktop) */}
        <div className="w-full lg:w-2/3 flex flex-col">
          {/* Badge */}
          <div className="mb-6 inline-flex">
            <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">AI-Powered Academic Excellence</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 
            id="hero-title"
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight"
            itemProp="headline"
          >
            {heroData.title.split(' ').map((word, index) => (
              <span key={index} className={word === "Perfected" ? "text-transparent bg-clip-text bg-gradient-to-r from-accent-electric-purple to-accent-cyan" : ""}>
                {word}{' '}
              </span>
            ))}
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl lg:text-2xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
            {heroData.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link href={heroData.ctaHref}>
              <Button className="bg-gradient-to-r from-accent-electric-purple to-accent-cyan text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all h-12 px-8 text-base font-semibold">
                <span className="flex items-center gap-2">
                  {heroData.ctaText} <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
            </Link>
            <Link href={heroData.secondaryCtaHref}>
              <Button variant="outline" className="border border-slate-600 text-white hover:bg-slate-800 h-12 px-8 text-base font-semibold">
                {heroData.secondaryCtaText}
              </Button>
            </Link>
          </div>

          {/* Trust Statement */}
          <p className="text-sm text-slate-400">
            <strong className="text-slate-300">{heroData.trustStatement}</strong>
          </p>
        </div>

        {/* Right Content (40% on desktop) - Static Content for SSR */}
        <div className="w-full lg:w-1/3">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-bold text-white mb-4">Key Features</h3>
            <div className="space-y-4">
              {heroData.features.map((feature) => (
                <div key={feature.id} className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                    <div className="text-white">
                      {getIconComponent(feature.icon)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{feature.title}</h4>
                    <p className="text-sm text-slate-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-slate-400">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex items-center justify-center">
            <div className="w-1 h-3 bg-slate-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}