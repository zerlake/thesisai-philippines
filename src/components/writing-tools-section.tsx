"use client";

import { BookCopy, ShieldCheck, Sparkles } from "lucide-react";

const tools = [
  {
    icon: <BookCopy className="h-8 w-8" />,
    title: "Cite Sources Instantly",
    description: "Generate accurate citations in APA, MLA, and Chicago formats. Just describe your source, and we'll do the rest.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    title: "Check for Plagiarism",
    description: "Ensure academic integrity with our powerful originality checker. Scan your work against billions of sources to avoid unintentional plagiarism.",
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: "Improve Your Writing",
    description: "Go beyond citations. Use our AI assistant to improve grammar, clarity, and academic tone, ensuring your paper is polished and professional.",
  },
];

export function WritingToolsSection() {
  return (
    <section className="bg-muted/50 py-16 md:py-24 lg:py-32">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Powerful Citation and Writing Tools
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to write with confidence and academic integrity, all in one place.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="p-8 border rounded-lg bg-background"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                {tool.icon}
              </div>
              <h3 className="text-xl font-semibold">{tool.title}</h3>
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