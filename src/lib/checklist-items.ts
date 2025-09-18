import { Edit3, FileCheck2, Sparkles, GitBranch } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
  toolName?: string;
};

export type ChecklistPhase = {
  id: string;
  title: string;
  icon: LucideIcon;
  items: ChecklistItem[];
};

export const thesisChecklist: ChecklistPhase[] = [
  {
    id: "phase-1",
    title: "Getting Started",
    icon: Sparkles,
    items: [
      {
        id: "item-1-1",
        title: "Define a Research Topic",
        description: "Choose a topic that is interesting, relevant, and feasible to research.",
        href: "/topic-ideas",
        toolName: "Topic Idea Generator",
      },
      {
        id: "item-1-2",
        title: "Formulate a Research Problem",
        description: "Clearly state the specific issue or gap your research will address.",
      },
      {
        id: "item-1-3",
        title: "Write Research Questions",
        description: "Develop clear, focused questions that your project will answer.",
      },
      {
        id: "item-1-4",
        title: "Conduct a Literature Search",
        description: "Find and evaluate relevant academic sources for your literature review.",
        href: "/research",
        toolName: "Research Helper",
      },
    ],
  },
  {
    id: "phase-2",
    title: "Structuring Your Project",
    icon: GitBranch,
    items: [
      {
        id: "item-2-1",
        title: "Create a Project Outline",
        description: "Plan the structure of your chapters and the main points for each section.",
        href: "/outline",
        toolName: "Outline Generator",
      },
      {
        id: "item-2-2",
        title: "Write a Compelling Introduction",
        description: "Hook the reader, provide background, and state your research problem and questions.",
      },
      {
        id: "item-2-3",
        title: "Choose a Research Methodology",
        description: "Describe and justify the methods you will use to collect and analyze data.",
        href: "/methodology",
        toolName: "Methodology Helper",
      },
      {
        id: "item-2-4",
        title: "Present Your Research Results",
        description: "Objectively report the findings of your research using tables, charts, and text.",
        href: "/results",
        toolName: "Results Helper",
      },
      {
        id: "item-2-5",
        title: "Discuss the Meaning of the Results",
        description: "Interpret your findings, explain their significance, and relate them to your literature review.",
        href: "/results",
        toolName: "Results Helper",
      },
      {
        id: "item-2-6",
        title: "Write a Strong Conclusion",
        description: "Summarize your research, answer your main research question, and provide recommendations.",
        href: "/conclusion",
        toolName: "Conclusion Helper",
      },
    ],
  },
  {
    id: "phase-3",
    title: "Writing It Up",
    icon: Edit3,
    items: [
      {
        id: "item-3-1",
        title: "Use an Academic Writing Style",
        description: "Ensure your language is formal, objective, clear, and concise.",
        href: "/paraphraser",
        toolName: "Paraphrasing Tool",
      },
      {
        id: "item-3-2",
        title: "Structure Your Paragraphs Logically",
        description: "Each paragraph should focus on a single idea, with a clear topic sentence.",
      },
      {
        id: "item-3-3",
        title: "Use Clear Transitions",
        description: "Connect your ideas smoothly between paragraphs and sections.",
      },
    ],
  },
  {
    id: "phase-4",
    title: "The Finishing Touches",
    icon: FileCheck2,
    items: [
      {
        id: "item-4-1",
        title: "Create a Title Page",
        description: "Format your title page according to your university's guidelines.",
        href: "/title-page",
        toolName: "Title Page Generator",
      },
      {
        id: "item-4-2",
        title: "Write a Concise Abstract",
        description: "Provide a short summary of your entire project. Use the AI Assistant in the editor.",
      },
      {
        id: "item-4-3",
        title: "Format the Reference List",
        description: "Ensure all citations are correct and consistently formatted in the required style.",
        href: "/bibliography",
        toolName: "Bibliography Generator",
      },
      {
        id: "item-4-4",
        title: "Proofread for Errors",
        description: "Carefully check for any spelling, grammar, and punctuation mistakes.",
        href: "/grammar-check",
        toolName: "Grammar & Writing Check",
      },
      {
        id: "item-4-5",
        title: "Run a Plagiarism Check",
        description: "Use a plagiarism checker to ensure all sources are properly cited.",
        href: "/originality-check",
        toolName: "Originality Checker",
      },
    ],
  },
];