import {
  Lightbulb,
  BookOpen,
  FlaskConical,
  BarChart3,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

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
    title: "Phase 1: Pre-Writing & Proposal",
    icon: Lightbulb,
    items: [
      { id: "p1-1", title: "Brainstorm & Select a Topic", description: "Choose a researchable and interesting topic.", href: "/tools/topic-ideas", toolName: "Topic Idea Generator" },
      { id: "p1-2", title: "Conduct Preliminary Research", description: "Gather initial sources to confirm topic viability.", href: "/tools/research-helper", toolName: "Research Helper" },
      { id: "p1-3", title: "Develop Research Questions", description: "Formulate clear, focused questions your research will answer." },
      { id: "p1-4", title: "Create a Detailed Outline", description: "Structure your entire paper chapter by chapter.", href: "/tools/outline-generator", toolName: "Outline Generator" },
      { id: "p1-5", title: "Write & Defend Proposal", description: "Draft Chapters 1-3 and get approval from your panel." },
    ],
  },
  {
    id: "phase-2",
    title: "Phase 2: Literature Review",
    icon: BookOpen,
    items: [
      { id: "p2-1", title: "Gather Sources", description: "Find relevant academic literature for your topic.", href: "/tools/research-helper", toolName: "Research Helper" },
      { id: "p2-2", title: "Synthesize Literature", description: "Analyze and connect ideas from your sources." },
      { id: "p2-3", title: "Draft Chapter II", description: "Write the complete Review of Related Literature." },
    ],
  },
  {
    id: "phase-3",
    title: "Phase 3: Methodology & Data Collection",
    icon: FlaskConical,
    items: [
      { id: "p3-1", title: "Finalize Research Design", description: "Confirm your overall approach (qualitative, quantitative, etc.).", href: "/tools/methodology", toolName: "Methodology Helper" },
      { id: "p3-2", title: "Develop Instruments", description: "Create your survey, interview questions, or experiment." },
      { id: "p3-3", title: "Gather Data", description: "Collect information from your participants or sources." },
      { id: "p3-4", title: "Draft Chapter III", description: "Write the complete Methodology section." },
    ],
  },
  {
    id: "phase-4",
    title: "Phase 4: Data Analysis & Results",
    icon: BarChart3,
    items: [
      { id: "p4-1", title: "Analyze Data", description: "Process your collected data using appropriate techniques.", href: "/tools/results", toolName: "Results Helper" },
      { id: "p4-2", title: "Present Findings", description: "Create tables, charts, and describe your results." },
      { id: "p4-3", title: "Draft Chapter IV", description: "Write the complete Results and Discussion section." },
    ],
  },
  {
    id: "phase-5",
    title: "Phase 5: Finalization & Defense",
    icon: GraduationCap,
    items: [
      { id: "p5-1", title: "Draft Chapter V", description: "Write the Summary, Conclusion, and Recommendations.", href: "/tools/conclusion", toolName: "Conclusion Helper" },
      { id: "p5-2", title: "Final Review & Edit", description: "Proofread the entire manuscript for errors." },
      { id: "p5-3", title: "Prepare for Oral Defense", description: "Create your presentation and practice your delivery." },
      { id: "p5-4", title: "Submit Final Paper", description: "Complete all revisions and submit the final bound copies." },
    ],
  },
];