import {
  BookCheck,
  BrainCircuit,
  ClipboardCheck,
  ClipboardPen,
  FileText,
  FlaskConical,
  Lightbulb,
  List,
  Presentation,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

interface QuickAccessItem {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export const quickAccessItems: QuickAccessItem[] = [
  {
    icon: BrainCircuit,
    title: "Topic Idea Generator",
    description: "Brainstorm your topic.",
    href: "/topic-ideas",
  },
  {
    icon: List,
    title: "Outline Generator",
    description: "Structure your thesis.",
    href: "/outline",
  },
  {
    icon: FlaskConical,
    title: "Research Helper",
    description: "Find academic papers.",
    href: "/research",
  },
  {
    icon: ClipboardPen,
    title: "Methodology Helper",
    description: "Design your research.",
    href: "/methodology",
  },
  {
    icon: ClipboardCheck,
    title: "Results Helper",
    description: "Present your findings.",
    href: "/results",
  },
  {
    icon: BookCheck,
    title: "Conclusion Helper",
    description: "Summarize your work.",
    href: "/conclusion",
  },
  {
    icon: Presentation,
    title: "Presentation Maker",
    description: "Create your slide deck.",
    href: "/presentation",
  },
  {
    icon: Lightbulb,
    title: "Flashcards",
    description: "Study key concepts.",
    href: "/flashcards",
  },
  {
    icon: ShieldCheck,
    title: "Originality Check",
    description: "Scan for plagiarism.",
    href: "/originality-check",
  },
  {
    icon: FileText,
    title: "Reference Manager",
    description: "Manage your citations.",
    href: "/references",
  },
  {
    icon: FileText,
    title: "PDF & Document Analysis",
    description: "Analyze your documents.",
    href: "/document-analyzer",
  },
];
