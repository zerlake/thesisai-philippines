"use client";

import {
  University,
  Users,
  Presentation,
  BookCopy,
  Bot,
  FlaskConical,
  Target,
  FileText,
  Lightbulb,
  Network,
  FileCheck,
  Share2,
  BookOpen,
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Button } from "@/components/ui/button";

const phases = [
  {
    id: "conceptualize",
    label: "01. Conceptualize",
    color: "from-blue-500 to-blue-600",
    features: [
      {
        id: "conceptualize-1",
        icon: <Target className="h-8 w-8" />,
        title: "Research Conceptualization Tools",
        description: "Variable Mapping Tool and Research Problem Identifier with Philippine-specific data",
        badge: "Pro",
        link: "/documentation/research-conceptualization",
      },
      {
        id: "conceptualize-2",
        icon: <Lightbulb className="h-8 w-8" />,
        title: "AI Idea Generation",
        description: "Generate research questions, topic ideas, and chapter outlines tailored to your field",
        badge: "AI",
        link: "/documentation/ai-idea-generation",
      },
      {
        id: "conceptualize-3",
        icon: <Lightbulb className="h-8 w-8" />,
        title: "Research Workflow Management",
        description: "Track tasks, deadlines, and progress with comprehensive workflow tools",
        badge: "Pro",
        link: "/documentation/workflow-management",
      },
    ],
  },
  {
    id: "research",
    label: "02. Research",
    color: "from-purple-500 to-purple-600",
    features: [
      {
        id: "research-1",
        icon: <BookOpen className="h-8 w-8" />,
        title: "Research Article Analyzer",
        description: "Extract methodology, findings, conclusions with annotation tools and literature matrices",
        badge: "Professional",
        link: "/documentation/article-analyzer",
      },
      {
        id: "research-2",
        icon: <Network className="h-8 w-8" />,
        title: "Collaborative Literature Review",
        description: "Annotate, tag, and analyze literature together with real-time collaboration",
        badge: "Team",
        link: "/documentation/collaborative-literature-review",
      },
      {
        id: "research-3",
        icon: <FileText className="h-8 w-8" />,
        title: "Privacy-Preserving PDF Analysis",
        description: "Analyze PDFs directly in your browser—no server uploads, complete privacy",
        badge: "Secure",
        link: "/documentation/pdf-analysis",
      },
      {
        id: "research-4",
        icon: <FlaskConical className="h-8 w-8" />,
        title: "Methodology & Data Tools",
        description: "Design studies with interactive advisors, run statistical tests, generate charts",
        badge: "Professional",
        link: "/documentation/methodology-tools",
      },
    ],
  },
  {
    id: "write",
    label: "03. Write & Refine",
    color: "from-emerald-500 to-emerald-600",
    features: [
      {
        id: "write-1",
        icon: <Bot className="h-8 w-8" />,
        title: "AI Writing & Research Suite",
        description: "From topic ideas to conclusions, leverage AI at every step of your research process",
        badge: "AI",
        link: "/documentation/ai-writing-suite",
      },
      {
        id: "write-2",
        icon: <BookCopy className="h-8 w-8" />,
        title: "Citation & Originality Hub",
        description: "Generate citations, manage bibliography, and ensure academic integrity",
        badge: "Essential",
        link: "/documentation/citation-hub",
      },
      {
        id: "write-3",
        icon: <FileText className="h-8 w-8" />,
        title: "Intelligent Synthesis & Paraphrasing",
        description: "Synthesize sources, rewrite for clarity, and maintain academic tone",
        badge: "AI",
        link: "/documentation/synthesis-paraphrasing",
      },
    ],
  },
  {
    id: "submit",
    label: "04. Submit & Present",
    color: "from-orange-500 to-orange-600",
    features: [
      {
        id: "submit-1",
        icon: <University className="h-8 w-8" />,
        title: "University-Specific Formatting",
        description: "Access formatting guides for major Philippine universities",
        badge: "Essential",
        link: "/documentation/university-formatting",
      },
      {
        id: "submit-2",
        icon: <FileCheck className="h-8 w-8" />,
        title: "Format Compliance Checker",
        description: "Automated checks against your university's specific requirements",
        badge: "Pro",
        link: "/documentation/format-checker",
      },
      {
        id: "submit-3",
        icon: <Share2 className="h-8 w-8" />,
        title: "Advisor & Critic Collaboration",
        description: "Submit drafts for advisor feedback and manuscript critic certification",
        badge: "Team",
        link: "/documentation/advisor-collaboration",
      },
      {
        id: "submit-4",
        icon: <Users className="h-8 w-8" />,
        title: "Research Team Collaboration",
        description: "Shared workspaces, task assignments, progress tracking for group projects",
        badge: "Team",
        link: "/documentation/team-collaboration",
      },
      {
        id: "submit-5",
        icon: <Presentation className="h-8 w-8" />,
        title: "Defense Preparation Suite",
        description: "Generate slides, practice with AI Q&A simulator, study with flashcards",
        badge: "Professional",
        link: "/documentation/defense-preparation",
      },
    ],
  },
];

const getBadgeColor = (badge: string) => {
  switch (badge) {
    case "AI":
      return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
    case "Pro":
      return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
    case "Professional":
      return "bg-pink-500/20 text-pink-300 border border-pink-500/30";
    case "Team":
      return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    case "Secure":
      return "bg-green-500/20 text-green-300 border border-green-500/30";
    case "Essential":
      return "bg-orange-500/20 text-orange-300 border border-orange-500/30";
    default:
      return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
  }
};

export function FeaturesSectionCarousel() {
  const prefersReducedMotion = useReducedMotion();
  const [activePhase, setActivePhase] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  const nextPhase = () => {
    setActivePhase((prev) => (prev + 1) % phases.length);
    triggerHaptic();
  };

  const prevPhase = () => {
    setActivePhase((prev) => (prev - 1 + phases.length) % phases.length);
    triggerHaptic();
  };

  if (!mounted) {
    return null;
  }

  const currentPhase = phases[activePhase];

  return (
    <section id="features" className="bg-gradient-to-b from-slate-900 to-slate-800 py-16 md:py-24">
      <div className="container">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white opacity-0 animate-[fade-in_0.5s_ease-out_0.2s_forwards]">
            Enterprise-Grade Academic Tools
          </h2>
          <p className="mt-6 text-lg text-slate-300 opacity-0 animate-[fade-in_0.5s_ease-out_0.3s_forwards]">
            Comprehensive AI-powered tools for every stage of your academic journey.
          </p>
        </div>

        {/* Phase Tabs */}
        <div className="mb-12 flex flex-wrap justify-center gap-2 md:gap-4 opacity-0 animate-[fade-in_0.5s_ease-out_0.3s_forwards]">
          {phases.map((phase, idx) => (
            <button
              key={phase.id}
              onClick={() => {
                setActivePhase(idx);
                triggerHaptic();
              }}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
                activePhase === idx
                  ? `bg-gradient-to-r ${phase.color} text-white shadow-lg`
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
              }`}
            >
              {phase.label}
            </button>
          ))}
        </div>

        {/* Features Carousel */}
        <div className="mb-12 opacity-0 animate-[fade-in_0.5s_ease-out_0.4s_forwards]">
          {/* Phase Title */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {currentPhase.label}
              </h3>
              <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${currentPhase.color}`} />
            </div>

            {/* Navigation Arrows */}
            <div className="flex gap-2">
              <button
                onClick={prevPhase}
                onMouseEnter={triggerHaptic}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all"
                aria-label="Previous phase"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextPhase}
                onMouseEnter={triggerHaptic}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all"
                aria-label="Next phase"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500"
            key={activePhase}
          >
            {currentPhase.features.map((feature, idx) => (
              <Link key={feature.id} href={feature.link} onMouseEnter={triggerHaptic}>
                <div className="group relative h-full p-6 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-slate-600/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer overflow-hidden opacity-0 animate-[fade-in_0.5s_ease-out] opacity-100"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Premium Badge */}
                  <div className="absolute top-4 right-4 inline-flex items-center gap-1">
                    <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getBadgeColor(feature.badge)}`}>
                      {feature.badge === "AI" && <span>⚡</span>}
                      {feature.badge === "Pro" && <Star className="w-3 h-3" />}
                      {feature.badge === "Advanced" && <span>🎯</span>}
                      {feature.badge === "Team" && <Users className="w-3 h-3" />}
                      {feature.badge === "Secure" && <span>🔒</span>}
                      {feature.badge === "Essential" && <span>✓</span>}
                      {feature.badge}
                    </div>
                  </div>

                  <div className="relative">
                    {/* Icon Background */}
                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${currentPhase.color} bg-opacity-20 group-hover:bg-opacity-40 transition-colors`}>
                      <div className="text-white">{feature.icon}</div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 transition-all mb-2">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Arrow on hover */}
                    <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-sm text-slate-300 group-hover:text-blue-300 transition-colors">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="mt-16 p-8 md:p-12 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 backdrop-blur-sm opacity-0 animate-[fade-in_0.5s_ease-out_0.8s_forwards]">
          <p className="text-center text-base text-slate-300 mb-8 font-medium">
            Trusted by researchers and institutions
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "15+", desc: "Enterprise Tools" },
              { label: "100%", desc: "Privacy Protected" },
              { label: "99.9%", desc: "Platform Uptime" },
            ].map((item, idx) => (
              <div key={idx} className="text-center group cursor-default">
                <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 group-hover:from-blue-300 group-hover:to-cyan-400 transition-all">
                  {item.label}
                </p>
                <p className="text-base text-slate-300 mt-3 group-hover:text-slate-200 transition-colors">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center opacity-0 animate-[fade-in_0.5s_ease-out_1s_forwards]">
          <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
            💡 Click any card above to learn more about that feature
          </p>
        </div>
      </div>
    </section>
  );
}
