import {
  Lightbulb,
  BookOpen,
  FlaskConical,
  BarChart3,
  GraduationCap,
  FileCheck2,
  type LucideIcon,
} from "lucide-react";

export type Milestone = {
  key: string;
  title: string;
  icon: LucideIcon;
};

export const thesisMilestones: Milestone[] = [
  { key: "proposal_defense", title: "Proposal Defense", icon: Lightbulb },
  { key: "chapter_2_draft", title: "Chapter II Draft", icon: BookOpen },
  { key: "data_collection", title: "Data Collection Complete", icon: FlaskConical },
  { key: "chapter_4_draft", title: "Chapter IV Draft", icon: BarChart3 },
  { key: "final_draft", title: "Full Manuscript Draft", icon: FileCheck2 },
  { key: "final_defense", title: "Final Defense", icon: GraduationCap },
];