"use client";

import { BrainCircuitIcon, LanguagesIcon, SparklesIcon, Zap, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

const tools = [
  {
    icon: <BrainCircuitIcon className="h-8 w-8" />,
    title: "AI Idea Generation",
    description: "Overcome writer's block by generating topic ideas, research questions, and chapter outlines tailored to your field of study.",
    benefits: ["Topic Ideas", "Research Questions", "Chapter Outlines"]
  },
  {
    icon: <SparklesIcon className="h-8 w-8" />,
    title: "Intelligent Synthesis",
    description: "Select multiple sources from your research and let the AI write a cohesive paragraph that synthesizes the key themes.",
    benefits: ["Literature Review", "Key Theme Synthesis", "Coherent Writing"]
  },
  {
    icon: <LanguagesIcon className="h-8 w-8" />,
    title: "Advanced Paraphrasing",
    description: "Rewrite sentences to improve clarity, vary your language, and ensure your work is original, all while maintaining an academic tone.",
    benefits: ["Clarity Improvement", "Language Variation", "Originality Check"]
  },
];

export function AiToolkitSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-accent-orange" />
            <span className="text-sm font-semibold text-accent-cyan bg-accent-electric-purple/10 px-3 py-1 rounded-full">
              Powered by Advanced AI
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Your Intelligent Academic Partner
          </h2>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
            Harness cutting-edge AI to accelerate research, enhance writing quality, and maintain academic integrity throughout your thesis journey.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3 mb-12">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="group relative p-8 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-accent-electric-purple/30 hover:bg-slate-800/80 transition-all hover:shadow-xl hover:shadow-accent-electric-purple/10"
            >
              {/* Accent border on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent-electric-purple/5 to-accent-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-accent-electric-purple/20 to-accent-cyan/20 group-hover:from-accent-electric-purple/40 group-hover:to-accent-cyan/40 transition-colors">
                  <span className="text-accent-cyan group-hover:text-accent-orange transition-colors">
                    {tool.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent-electric-purple group-hover:to-accent-cyan transition-all">
                  {tool.title}
                </h3>
                <p className="text-slate-300 leading-relaxed mb-6">
                  {tool.description}
                </p>

                {/* Benefits list */}
                <div className="space-y-2 pt-6 border-t border-slate-700/50">
                  {tool.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust & Security Section */}
        <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Enterprise-Grade Security & Privacy
              </h3>
              <p className="text-slate-300 mb-6">
                Your documents and data are protected with industry-leading security standards. We never use your work to train models or share with third parties.
              </p>
              <ul className="space-y-3">
                {[
                  "End-to-end encryption for all documents",
                  "GDPR compliant data handling",
                  "Zero data retention after processing",
                  "Academic integrity guaranteed"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-300">
                    <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Average Time Saved</p>
                  <p className="text-3xl font-bold text-blue-400">15+ Hours</p>
                  <p className="text-xs text-slate-500">Per thesis project</p>
                </div>
                <div className="border-t border-slate-700/50 pt-4">
                  <p className="text-sm text-slate-400">User Satisfaction</p>
                  <p className="text-3xl font-bold text-blue-400">4.8/5.0</p>
                  <p className="text-xs text-slate-500">From 2,000+ reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-2xl hover:shadow-purple-500/50 h-12 px-8 text-base font-semibold"
          >
            <Link href="/register">Experience the Power of AI Today</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}