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
  ChevronDown
} from "lucide-react";
import { useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const featureCategories = [
  {
    id: "conceptualize",
    phase: "01. Conceptualize",
    title: "Research Planning",
    description: "Define your research focus and identify your research gap",
    color: "from-blue-500 to-blue-600",
    icon: <Target className="h-8 w-8" />,
    features: [
      {
        icon: <Target className="h-6 w-6" />,
        title: "Research Conceptualization Tools",
        description: "Variable Mapping Tool and Research Problem Identifier with Philippine-specific data",
      },
      {
        icon: <Lightbulb className="h-6 w-6" />,
        title: "AI Idea Generation",
        description: "Generate research questions, topic ideas, and chapter outlines tailored to your field",
      },
      {
        icon: <Lightbulb className="h-6 w-6" />,
        title: "Research Workflow Management",
        description: "Track tasks, deadlines, and progress with comprehensive workflow tools",
      },
    ]
  },
  {
    id: "research",
    phase: "02. Research",
    title: "Literature & Analysis",
    description: "Analyze sources and conduct your research with AI assistance",
    color: "from-purple-500 to-purple-600",
    icon: <BookOpen className="h-8 w-8" />,
    features: [
      {
        icon: <BookOpen className="h-6 w-6" />,
        title: "Research Article Analyzer",
        description: "Extract methodology, findings, conclusions with annotation tools and literature matrices",
      },
      {
        icon: <Network className="h-6 w-6" />,
        title: "Collaborative Literature Review",
        description: "Annotate, tag, and analyze literature together with real-time collaboration",
      },
      {
        icon: <FileText className="h-6 w-6" />,
        title: "Privacy-Preserving PDF Analysis",
        description: "Analyze PDFs directly in your browser—no server uploads, complete privacy",
      },
      {
        icon: <FlaskConical className="h-6 w-6" />,
        title: "Methodology & Data Tools",
        description: "Design studies with interactive advisors, run statistical tests, generate charts",
      },
    ]
  },
  {
    id: "write",
    phase: "03. Write & Refine",
    title: "Content Creation",
    description: "Draft and improve your thesis with AI-powered writing tools",
    color: "from-emerald-500 to-emerald-600",
    icon: <Bot className="h-8 w-8" />,
    features: [
      {
        icon: <Bot className="h-6 w-6" />,
        title: "AI Writing & Research Suite",
        description: "From topic ideas to conclusions, leverage AI at every step of your research process",
      },
      {
        icon: <BookCopy className="h-6 w-6" />,
        title: "Citation & Originality Hub",
        description: "Generate citations, manage bibliography, and ensure academic integrity",
      },
      {
        icon: <FileText className="h-6 w-6" />,
        title: "Intelligent Synthesis & Paraphrasing",
        description: "Synthesize sources, rewrite for clarity, and maintain academic tone",
      },
    ]
  },
  {
    id: "submit",
    phase: "04. Submit & Present",
    title: "Finalization & Defense",
    description: "Polish, submit, and prepare for your defense",
    color: "from-orange-500 to-orange-600",
    icon: <Presentation className="h-8 w-8" />,
    features: [
      {
        icon: <University className="h-6 w-6" />,
        title: "University-Specific Formatting",
        description: "Access formatting guides for major Philippine universities",
      },
      {
        icon: <FileCheck className="h-6 w-6" />,
        title: "Format Compliance Checker",
        description: "Automated checks against your university's specific requirements",
      },
      {
        icon: <Share2 className="h-6 w-6" />,
        title: "Advisor & Critic Collaboration",
        description: "Submit drafts for advisor feedback and manuscript critic certification",
      },
      {
        icon: <Users className="h-6 w-6" />,
        title: "Research Team Collaboration",
        description: "Shared workspaces, task assignments, progress tracking for group projects",
      },
      {
        icon: <Presentation className="h-6 w-6" />,
        title: "Defense Preparation Suite",
        description: "Generate slides, practice with AI Q&A simulator, study with flashcards",
      },
    ]
  },
];

export function FeaturesSection() {
  const [expandedCategory, setExpandedCategory] = useState("conceptualize");
  const prefersReducedMotion = useReducedMotion();

  // Haptic feedback helper
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <section id="features" className="bg-gradient-to-b from-slate-900 to-slate-800 py-16 md:py-24">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white opacity-0 animate-[fade-in_0.5s_ease-out_0.2s_forwards]">
            Features for Every Stage
          </h2>
          <p className="mt-6 text-lg text-slate-300 opacity-0 animate-[fade-in_0.5s_ease-out_0.3s_forwards]">
            Follow your research journey with tools designed for each phase—from planning through defense.
          </p>
        </div>

        {/* Phase-based Feature Accordion */}
        <div className="grid gap-4 max-w-4xl mx-auto">
          {featureCategories.map((category) => (
            <div
              key={category.id}
              className="group border border-slate-700/50 rounded-xl overflow-hidden motion-safe:transition-colors"
            >
              {/* Category Header - Always Visible */}
              <button
                onClick={() => {
                  triggerHaptic();
                  setExpandedCategory(expandedCategory === category.id ? "" : category.id);
                }}
                className={`w-full px-8 py-5 flex items-center justify-between transition-all ${
                  expandedCategory === category.id
                    ? `bg-gradient-to-r ${category.color} bg-opacity-10 border-b border-slate-700/50`
                    : "bg-slate-800/50 hover:bg-slate-800/70"
                } motion-safe:transition-transform`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${category.color} bg-opacity-20`}>
                    <div className="text-white text-lg">{category.icon}</div>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${
                      expandedCategory === category.id ? "text-blue-300" : "text-slate-400"
                    }`}>
                      {category.phase}
                    </p>
                    <h3 className="text-xl font-bold text-white">{category.title}</h3>
                  </div>
                </div>
                <div className={`transform transition-transform ${expandedCategory === category.id ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </div>
              </button>

              {/* Expandable Features List */}
              {expandedCategory === category.id && (
                <div className="px-8 py-6 bg-slate-900/50 space-y-4 border-t border-slate-700/50 overflow-hidden">
                  <p className="text-base text-slate-300 mb-6 font-medium leading-relaxed opacity-0 animate-[fade-in_0.5s_ease-out_0.1s_forwards]">
                    {category.description}
                  </p>
                  <div className="space-y-4">
                    {category.features.map((feature, idx) => (
                      <div
                        key={feature.title}
                        className="flex gap-4 p-5 rounded-lg bg-slate-800/50 border border-slate-700/30 group/item motion-safe:transition-transform"
                        onMouseEnter={triggerHaptic}
                      >
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0 bg-gradient-to-br ${category.color} bg-opacity-20 group-hover/item:bg-opacity-40 transition-colors`}>
                          <div className="text-blue-300">{feature.icon}</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-base mb-2 group-hover/item:text-blue-300 transition-colors">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 p-8 md:p-12 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-600/5 border border-blue-500/10 opacity-0 animate-[fade-in_0.5s_ease-out_0.8s_forwards]">
          <p className="text-center text-base text-slate-300 mb-8 font-medium">
            Everything you need for thesis success
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "13+", desc: "Advanced Tools" },
              { label: "100%", desc: "Privacy Protected" },
              { label: "99.9%", desc: "Platform Uptime" }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  {item.label}
                </p>
                <p className="text-base text-slate-300 mt-3">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip for First-time Users */}
        <div className="mt-12 text-center opacity-0 animate-[fade-in_0.5s_ease-out_1s_forwards]">
          <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
            💡 Click any phase above to explore features for that stage
          </p>
        </div>
      </div>
    </section>
  );
}