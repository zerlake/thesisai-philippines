"use client";

import { motion } from "framer-motion";
import { Target, BookOpen, Bot, Presentation, LucideIcon } from "lucide-react";
import { phases } from "@/data/landing-timeline";
import { TimelineItem } from "./timeline-item";

export const iconMap: { [key: string]: LucideIcon } = {
  Target,
  BookOpen,
  Bot,
  Presentation,
};

export function ThesisJourneyTimeline() {
  return (
    <section className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto opacity-0 animate-[fade-in_0.5s_ease-out_0.2s_forwards]">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Thesis Journey</span> Made Simple
          </h2>
          <p className="text-lg text-slate-300">
            Follow a streamlined process from concept to defense with AI-powered tools
          </p>
        </div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-1/2 transform -translate-x-px w-0.5 h-full bg-gradient-to-b from-blue-500/30 via-purple-500/30 to-cyan-500/30 hidden lg:block"></div>

          <div className="space-y-24 lg:space-y-32">
            {phases.map((phase, index) => (
              <TimelineItem
                key={phase.id}
                phase={phase}
                index={index}
                alignment={index % 2 === 0 ? 'left' : 'right'}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}