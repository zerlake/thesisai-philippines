"use client";

import { Banknote, FileSignature, Sparkles, ListChecks } from "lucide-react";

const features = [
  {
    icon: <ListChecks className="h-8 w-8" />,
    title: "Clear Review Queue",
    description: "View all manuscripts that have been approved by advisors and are ready for your final certification, organized in one place.",
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: "AI-Powered Review Tools",
    description: "Leverage AI to quickly identify areas for improvement in grammar, style, and clarity, helping you provide thorough feedback.",
  },
  {
    icon: <FileSignature className="h-8 w-8" />,
    title: "Simple Certification Workflow",
    description: "Easily certify a document as ready for submission or send it back to the student with your comments for revision.",
  },
  {
    icon: <Banknote className="h-8 w-8" />,
    title: "Billing and Payment Tracking",
    description: "Set your review fee for each manuscript and track payment statuses directly from your dashboard to manage your earnings.",
  },
];

export function ForCriticsSection() {
  return (
    <section className="py-12 md:py-16 bg-slate-900 text-white">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Empowering Manuscript Critics</h2>
          <p className="mt-4 text-slate-300">
            Join ThesisAI as a manuscript critic to streamline your review process, manage payments, and provide high-quality feedback with the help of AI tools.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center p-6 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}