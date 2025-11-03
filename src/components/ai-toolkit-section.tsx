"use client";

import { BrainCircuitIcon, LanguagesIcon, SparklesIcon } from "lucide-react";

const tools = [
  {
    icon: <BrainCircuitIcon className="h-8 w-8" />,
    title: "AI Idea Generation",
    description: "Overcome writer's block by generating topic ideas, research questions, and chapter outlines tailored to your field of study.",
  },
  {
    icon: <SparklesIcon className="h-8 w-8" />,
    title: "Intelligent Synthesis",
    description: "Select multiple sources from your research and let the AI write a cohesive paragraph that synthesizes the key themes.",
  },
  {
    icon: <LanguagesIcon className="h-8 w-8" />,
    title: "Advanced Paraphrasing",
    description: "Rewrite sentences to improve clarity, vary your language, and ensure your work is original, all while maintaining an academic tone.",
  },
];

export function AiToolkitSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-background">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Your Intelligent Writing Partner
          </h2>
          <p className="mt-4 text-muted-foreground">
            Leverage our powerful AI toolkit to accelerate your research and enhance the quality of your writing.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="p-8 border border-border rounded-lg bg-card"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {tool.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground">{tool.title}</h3>
              <p className="mt-2 text-muted-foreground">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}