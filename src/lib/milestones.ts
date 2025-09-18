import { Shield, FileText, Mic, CheckCircle } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export type Milestone = {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const thesisMilestones: Milestone[] = [
  {
    key: "proposal_defense",
    title: "Proposal Defense",
    description: "Successfully defend the thesis proposal.",
    icon: Shield,
  },
  {
    key: "chapter_1_draft",
    title: "Chapter 1 Draft",
    description: "Submit the first draft of the introduction.",
    icon: FileText,
  },
  {
    key: "chapter_2_draft",
    title: "Chapter 2 Draft",
    description: "Submit the first draft of the literature review.",
    icon: FileText,
  },
  {
    key: "chapter_3_draft",
    title: "Chapter 3 Draft",
    description: "Submit the first draft of the methodology.",
    icon: FileText,
  },
  {
    key: "chapter_4_draft",
    title: "Chapter 4 Draft",
    description: "Submit the first draft of the results.",
    icon: FileText,
  },
  {
    key: "chapter_5_draft",
    title: "Chapter 5 Draft",
    description: "Submit the first draft of the conclusion.",
    icon: FileText,
  },
  {
    key: "final_defense",
    title: "Final Defense",
    description: "Successfully defend the completed thesis.",
    icon: Mic,
  },
  {
    key: "final_submission",
    title: "Final Submission",
    description: "Submit the final, approved thesis document.",
    icon: CheckCircle,
  },
];