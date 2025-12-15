import { LucideIcon } from "lucide-react";

export interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string; // Will store the name of the Lucide icon as a string
  className: string;
  iconBg: string;
  subFeatures?: { icon: string; text: string }[];
}

export const features: Feature[] = [
  {
    id: 1,
    title: "AI Research Assistant",
    description: "Intelligent research tools that find relevant sources and extract key insights",
    icon: "Bot",
    className: "md:col-span-2 md:row-span-1 bg-gradient-to-br from-blue-900/30 to-slate-800 border border-blue-500/20 rounded-2xl p-6",
    iconBg: "bg-blue-500/20",
  },
  {
    id: 2,
    title: "Thesis Structure Builder",
    description: "Create chapter outlines and structure with AI assistance",
    icon: "Target",
    className: "bg-slate-800/50 border border-slate-700/50 rounded-xl p-5",
    iconBg: "bg-purple-500/20",
  },
  {
    id: 3,
    title: "Literature Analyzer",
    description: "Analyze and synthesize academic papers with privacy-preserving tools",
    icon: "BookOpen",
    className: "md:col-span-1 md:row-span-2 bg-gradient-to-b from-purple-900/30 to-slate-800 border border-purple-500/20 rounded-2xl p-6 flex flex-col",
    iconBg: "bg-purple-500/20",
    subFeatures: [
      { icon: "FlaskConical", text: "Methodology Assistant" },
      { icon: "FileCheck", text: "Compliance Checker" },
      { icon: "University", text: "University Templates" },
    ],
  },
  {
    id: 4,
    title: "Citation Manager",
    description: "Generate and format citations in any academic style",
    icon: "FileText",
    className: "bg-slate-800/50 border border-slate-700/50 rounded-xl p-5",
    iconBg: "bg-cyan-500/20",
  },
  {
    id: 5,
    title: "Collaboration Hub",
    description: "Work with advisors and peers in real-time",
    icon: "Share2",
    className: "bg-slate-800/50 border border-slate-700/50 rounded-xl p-5",
    iconBg: "bg-blue-500/20",
  },
  {
    id: 6,
    title: "Defense Prep Suite",
    description: "Create slides and practice with AI-powered Q&A",
    icon: "Presentation",
    className: "md:col-span-2 md:row-span-1 bg-gradient-to-br from-cyan-900/30 to-slate-800 border border-cyan-500/20 rounded-2xl p-6",
    iconBg: "bg-cyan-500/20",
  },
];
