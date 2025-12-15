"use client";

import { motion } from "framer-motion";
import { ArrowRight, Target, BookOpen, Bot, FileText, Presentation } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Research Conceptualization",
    description: "Define your research focus and identify your research gap with AI tools",
    icon: <Target className="w-8 h-8" />,
    color: "from-brand-academic-blue to-accent-electric-purple"
  },
  {
    id: "02",
    title: "Literature & Data Analysis",
    description: "Analyze academic papers and datasets with privacy-preserving research tools",
    icon: <BookOpen className="w-8 h-8" />,
    color: "from-accent-electric-purple to-accent-cyan"
  },
  {
    id: "03",
    title: "Content Creation",
    description: "Draft chapters with AI-powered writing assistance and real-time feedback",
    icon: <Bot className="w-8 h-8" />,
    color: "from-accent-cyan to-accent-orange"
  },
  {
    id: "04",
    title: "Finalization & Defense",
    description: "Format, cite, and prepare for defense with comprehensive tools",
    icon: <Presentation className="w-8 h-8" />,
    color: "from-accent-orange to-emerald-500"
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto opacity-0 animate-[fade-in_0.5s_ease-out_0.2s_forwards]">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Your Complete Research Journey
          </h2>
          <p className="text-lg text-slate-300">
            A comprehensive journey from conceptualization to defense with AI-powered tools
          </p>
        </div>

        <div className="max-w-6xl mx-auto opacity-0 animate-[fade-in_0.5s_ease-out_0.3s_forwards]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className="relative transform-gpu"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                {/* Step number with gradient circle */}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold mb-6 absolute -top-6 left-4 z-10 transform-gpu`}>
                  <span className="text-lg">{step.id}</span>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 h-full backdrop-blur-sm transform-gpu">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center text-white mb-6 transform-gpu`}>
                    {step.icon}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-slate-300">{step.description}</p>
                </div>

                {/* Arrow between steps - hidden on last item */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-8 left-full w-full justify-center">
                    <ArrowRight className="w-6 h-6 text-slate-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Mobile arrow indicators */}
          <div className="flex lg:hidden justify-center mt-8 gap-8">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-slate-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center opacity-0 animate-[fade-in_0.5s_ease-out_0.4s_forwards]">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-0.5">
            <div className="bg-slate-900 rounded-full px-6 py-3">
              <p className="text-slate-300">
                All steps are powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">AI technology</span> and designed specifically for Filipino students
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}