"use client";

import {
  University,
  Users,
  Presentation,
  BookCopy,
  Bot,
  FlaskConical,
} from "lucide-react";

const features = [
  {
    icon: <Bot className="h-8 w-8" />,
    title: "AI Writing & Research Suite",
    description: "From topic ideas and literature synthesis to drafting conclusions, leverage AI at every step of your research process.",
  },
  {
    icon: <University className="h-8 w-8" />,
    title: "University-Specific Formatting",
    description: "Access detailed formatting and style guides for major Philippine universities to ensure your manuscript meets exact requirements.",
  },
  {
    icon: <FlaskConical className="h-8 w-8" />,
    title: "Methodology & Data Tools",
    description: "Design your study with interactive advisors for research methods, sampling, and statistical tests. Upload data to run analyses, generate charts, and interpret results with ease.",
  },
  {
    icon: <BookCopy className="h-8 w-8" />,
    title: "Citation & Originality Hub",
    description: "Generate citations in multiple styles, manage your bibliography, and ensure academic integrity with a powerful originality checker.",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Advisor & Critic Collaboration",
    description: "Seamlessly submit drafts to your advisor for feedback and to your manuscript critic for final certification, all within the platform.",
  },
  {
    icon: <Presentation className="h-8 w-8" />,
    title: "Defense Preparation Suite",
    description: "Generate presentation slides with speaker notes, practice with an AI Q&A simulator, and study key terms with flashcards to build confidence for your defense.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-slate-900 py-12 md:py-16">
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