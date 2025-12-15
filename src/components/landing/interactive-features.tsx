"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, BookOpen, Users, FileText, Share2, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";

const featureTabs = [
  {
    id: "research",
    name: "Research",
    features: [
      {
        name: "AI-Powered Search",
        description: "Go beyond keywords. Our AI understands your research question to find the most relevant papers from millions of sources.",
        icon: <BookOpen className="w-8 h-8" />,
      },
      {
        name: "Literature Analyzer",
        description: "Automatically extract key insights, summaries, and methodologies from academic papers. Identify research gaps with ease.",
        icon: <Bot className="w-8 h-8" />,
      },
    ],
  },
  {
    id: "writing",
    name: "Writing",
    features: [
      {
        name: "Thesis Structure Builder",
        description: "Generate a well-structured outline for your thesis, complete with chapter descriptions and key points to cover.",
        icon: <FileText className="w-8 h-8" />,
      },
      {
        name: "Citation Manager",
        description: "Automatically format citations and bibliographies in any academic style (APA, MLA, Chicago, etc.).",
        icon: <Presentation className="w-8 h-8" />,
      },
    ],
  },
  {
    id: "collaboration",
    name: "Collaboration",
    features: [
      {
        name: "Real-time Workspace",
        description: "Work with your advisor and peers in a shared environment. Leave comments, track changes, and manage tasks.",
        icon: <Users className="w-8 h-8" />,
      },
      {
        name: "Advisor Feedback Tools",
        description: "Streamline the feedback process with dedicated tools for advisors to provide targeted comments and suggestions.",
        icon: <Share2 className="w-8 h-8" />,
      },
    ],
  },
];

export function InteractiveFeatures() {
  const [activeTab, setActiveTab] = useState(featureTabs[0].id);

  return (
    <section className="py-20 bg-slate-800" id="features-demo">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            A New Way to Do Research
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Explore the powerful features that make ThesisAI the ultimate research companion.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 bg-slate-900/50 p-2 rounded-lg">
            {featureTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                )}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          {featureTabs.map((tab) =>
            activeTab === tab.id ? (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid md:grid-cols-2 gap-8 items-center"
              >
                {tab.features.map((feature, index) => (
                  <div key={index} className="bg-slate-900/50 p-6 rounded-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-slate-800 rounded-lg text-blue-400">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white">{feature.name}</h3>
                    </div>
                    <p className="text-slate-300 mb-4">{feature.description}</p>
                    <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                      <div className="text-slate-500 text-center">
                        <div className="text-4xl mb-2">{feature.icon}</div>
                        <p className="text-sm">Feature preview</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : null
          )}
        </div>
      </div>
    </section>
  );
}