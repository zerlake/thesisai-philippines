import { FilePlus2, PencilRuler, Send, Sparkles, Check } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

const steps = [
  {
    icon: <FilePlus2 className="h-8 w-8" />,
    step: "01",
    title: "Research Conceptualization",
    description: "Define your research focus with our Variable Mapping Tool and Research Problem Identifier to surface Philippine-specific issues.",
    highlights: ["Variable Mapping", "Problem Identification", "Literature Gap Analysis"]
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    step: "02",
    title: "AI-Powered Drafting",
    description: "Leverage advanced AI to generate outlines, synthesize literature, paraphrase content, and draft chapters with academic integrity.",
    highlights: ["Outline Generation", "Literature Synthesis", "Content Paraphrasing"]
  },
  {
    icon: <PencilRuler className="h-8 w-8" />,
    step: "03",
    title: "Review & Refinement",
    description: "Run format compliance checks, originality verification, and collaborate with advisors for feedback and improvements.",
    highlights: ["Format Checking", "Originality Verification", "Advisor Collaboration"]
  },
  {
    icon: <Send className="h-8 w-8" />,
    step: "04",
    title: "Submit & Defend",
    description: "Export in multiple formats, prepare defense materials with AI Q&A simulators, and present with confidence.",
    highlights: ["Multi-Format Export", "Defense Preparation", "Presentation Tools"]
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-4 md:py-8 bg-slate-800 -mt-[5%]">
      <div className="container">
        <div className="mx-auto mb-6 md:mb-8 max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Your Complete Research Journey
          </h2>
          <p className="mt-6 text-lg text-slate-300">
            From initial concept to final submission, ThesisAI guides you through every stage with intelligent, professional-grade tools.
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <div key={step.title} className="relative group">
              {/* Connection line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-[60%] w-[200%] h-1 bg-gradient-to-r from-blue-500/30 to-transparent -z-10" />
              )}

              <div className="p-6 md:p-8 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all h-full flex flex-col">
                {/* Step number and icon */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 group-hover:from-blue-500/40 group-hover:to-purple-600/40 transition-colors flex-shrink-0">
                    <span className="text-blue-400 group-hover:text-cyan-300 transition-colors">
                      {step.icon}
                    </span>
                  </div>
                  <span className="text-3xl font-bold text-slate-400 group-hover:text-blue-300 transition-colors">
                    {step.step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-lg md:text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 transition-all">
                  {step.title}
                </h3>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 flex-grow">
                  {step.description}
                </p>

                {/* Highlights */}
                <div className="space-y-2 pt-6 border-t border-slate-700/50">
                  {step.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-2xl hover:shadow-purple-500/50 h-12 px-8 text-base font-semibold"
          >
            <Link href="/register">Start Your Research Journey</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
