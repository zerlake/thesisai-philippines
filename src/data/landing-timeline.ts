import { LucideIcon } from "lucide-react";

export interface Phase {
  id: number;
  title: string;
  description: string;
  icon: string; // Will store the name of the Lucide icon as a string
  color: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
}

export const phases: Phase[] = [
  {
    id: 1,
    title: "Conceptualize",
    description: "Define your research focus and identify your research gap",
    icon: "Target",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400"
  },
  {
    id: 2,
    title: "Research",
    description: "Analyze sources and conduct your research with AI assistance",
    icon: "BookOpen",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400"
  },
  {
    id: 3,
    title: "Write & Refine",
    description: "Draft and improve your thesis with AI-powered writing tools",
    icon: "Bot",
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    iconColor: "text-cyan-400"
  },
  {
    id: 4,
    title: "Submit & Present",
    description: "Polish, submit, and prepare for your defense",
    icon: "Presentation",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    iconColor: "text-emerald-400"
  }
];