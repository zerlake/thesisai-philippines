"use client";

import {
  BarChart3,
  BookCopy,
  Bot,
  FlaskConical,
  Presentation,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: <Bot className="h-8 w-8" />,
    title: "AI-Powered Drafting",
    description: "Generate topic ideas, chapter outlines, and first drafts to overcome writer's block and accelerate your writing process.",
  },
  {
    icon: <FlaskConical className="h-8 w-8" />,
    title: "Complete Methodology Suite",
    description: "Utilize interactive tools for research design, sample size calculation, and finding the right statistical tests for your data.",
  },
  {
    icon: <BookCopy className="h-8 w-8" />,
    title: "Citation & Bibliography",
    description: "Instantly generate citations and compile a formatted bibliography in APA, MLA, or Chicago style, directly from your research.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    title: "Plagiarism Prevention",
    description: "Ensure academic integrity with an integrated originality checker that scans your work against billions of web sources.",
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Data to Discussion",
    description: "Create charts, interpret complex statistical results, and generate draft conclusions directly from your findings.",
  },
  {
    icon: <Presentation className="h-8 w-8" />,
    title: "Defense & Study Tools",
    description: "Automatically create presentation outlines for your defense and generate flashcards to study key concepts from your research.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-slate-900 py-12 md:py-16 lg:py-20">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Everything You Need to Succeed
          </h2>
          <p className="mt-4 text-slate-300">
            A complete toolkit designed for the modern student researcher, from
            initial idea to final defense.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-slate-800/50 border border-slate-700"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-slate-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}