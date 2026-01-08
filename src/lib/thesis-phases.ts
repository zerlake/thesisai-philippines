/**
 * Thesis Writing Phases Configuration
 * Centralized definitions for all phases with tools and features
 */

export type IconName = 
   | "Target"
   | "Lightbulb"
   | "BookOpen"
   | "Network"
   | "FileText"
   | "FlaskConical"
   | "Bot"
   | "BookCopy"
   | "University"
   | "FileCheck"
   | "Share2"
   | "Users"
   | "Presentation"
   | "Shield";

export interface PhaseFeature {
  id: string;
  icon: IconName;
  title: string;
  description: string;
  tools?: string[]; // List of tool names/routes available in this feature
}

export interface ThesisPhase {
  id: string;
  phaseNumber: number;
  phase: string; // e.g., "01. Conceptualize"
  title: string;
  description: string;
  longDescription: string;
  color: string; // Tailwind gradient class
  bgColor: string; // Background color class
  icon: IconName;
  features: PhaseFeature[];
  toolsCount: number;
  estimatedDuration: string; // e.g., "2-4 weeks"
}

export const THESIS_PHASES: ThesisPhase[] = [
  {
    id: "conceptualize",
    phaseNumber: 1,
    phase: "01. Conceptualize",
    title: "Research Planning",
    description: "Define your research focus and identify your research gap",
    longDescription:
      "Start your thesis journey by conceptualizing your research topic, defining your research questions, and identifying the research gap you want to address. Use AI-powered tools to generate ideas and create a structured research plan.",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    icon: "Target",
    features: [
      {
        id: "conceptualization-tools",
        icon: "Target",
        title: "Research Conceptualization Tools",
        description:
          "Variable Mapping Tool and Research Problem Identifier with Philippine-specific data",
        tools: ["variable-mapper", "problem-identifier", "topic-explorer"],
      },
      {
        id: "idea-generation",
        icon: "Lightbulb",
        title: "AI Idea Generation",
        description:
          "Generate research questions, topic ideas, and chapter outlines tailored to your field",
        tools: ["research-question-generator", "topic-ideator", "outline-generator"],
      },
      {
        id: "workflow-management",
        icon: "Lightbulb",
        title: "Research Workflow Management",
        description: "Track tasks, deadlines, and progress with comprehensive workflow tools",
        tools: ["task-tracker", "timeline-planner", "progress-monitor"],
      },
    ],
    toolsCount: 9,
    estimatedDuration: "2-4 weeks",
  },
  {
    id: "research",
    phaseNumber: 2,
    phase: "02. Research",
    title: "Literature & Analysis",
    description: "Analyze sources and conduct your research with AI assistance",
    longDescription:
      "Dive deep into your research by analyzing literature, conducting studies, and managing your data. Use collaborative tools to annotate sources, run statistical analyses, and organize your findings.",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    icon: "BookOpen",
    features: [
      {
        id: "article-analyzer",
        icon: "BookOpen",
        title: "Research Article Analyzer",
        description:
          "Extract methodology, findings, conclusions with annotation tools and literature matrices",
        tools: ["article-extractor", "annotation-tool", "literature-matrix"],
      },
      {
        id: "collaborative-review",
        icon: "Network",
        title: "Collaborative Literature Review",
        description: "Annotate, tag, and analyze literature together with real-time collaboration",
        tools: ["shared-annotations", "tagging-system", "collaboration-board"],
      },
      {
        id: "pdf-analysis",
        icon: "FileText",
        title: "Privacy-Preserving PDF Analysis",
        description: "Analyze PDFs directly in your browser—no server uploads, complete privacy",
        tools: ["pdf-analyzer", "text-extractor", "chart-generator"],
      },
      {
        id: "methodology-tools",
        icon: "FlaskConical",
        title: "Methodology & Data Tools",
        description:
          "Design studies with interactive advisors, run statistical tests, generate charts",
        tools: ["study-designer", "stats-calculator", "data-visualizer"],
      },
    ],
    toolsCount: 12,
    estimatedDuration: "4-8 weeks",
  },
  {
    id: "write",
    phaseNumber: 3,
    phase: "03. Write & Refine",
    title: "Content Creation",
    description: "Draft and improve your thesis with AI-powered writing tools",
    longDescription:
      "Transform your research into polished writing. Use AI assistance to draft chapters, improve clarity, check citations, and maintain academic integrity throughout your writing process.",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    icon: "Bot",
    features: [
      {
        id: "ai-writing",
        icon: "Bot",
        title: "AI Writing & Research Suite",
        description:
          "From topic ideas to conclusions, leverage AI at every step of your research process",
        tools: ["ai-writer", "chapter-drafter", "content-improver"],
      },
      {
        id: "citation-hub",
        icon: "BookCopy",
        title: "Citation & Originality Hub",
        description: "Generate citations, manage bibliography, and ensure academic integrity",
        tools: ["citation-generator", "bibliography-manager", "plagiarism-checker"],
      },
      {
        id: "synthesis",
        icon: "FileText",
        title: "Intelligent Synthesis & Paraphrasing",
        description:
          "Synthesize sources, rewrite for clarity, and maintain academic tone",
        tools: ["synthesis-tool", "paraphraser", "tone-checker"],
      },
    ],
    toolsCount: 9,
    estimatedDuration: "6-12 weeks",
  },
  {
    id: "submit",
    phaseNumber: 4,
    phase: "04. Submit & Present",
    title: "Finalization & Defense",
    description: "Polish, submit, and prepare for your defense",
    longDescription:
      "Finalize your thesis with proper formatting, prepare for submission, and get ready for your defense. Access university-specific guidelines and use preparation tools to ace your defense presentation.",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    icon: "Presentation",
    features: [
      {
        id: "university-formatting",
        icon: "University",
        title: "University-Specific Formatting",
        description: "Access formatting guides for major Philippine universities",
        tools: ["format-templates", "style-guides", "university-database"],
      },
      {
        id: "compliance-checker",
        icon: "FileCheck",
        title: "Format Compliance Checker",
        description:
          "Automated checks against your university's specific requirements",
        tools: ["format-validator", "requirement-checker", "auto-fixer"],
      },
      {
        id: "collaboration",
        icon: "Share2",
        title: "Advisor & Critic Collaboration",
        description:
          "Submit drafts for advisor feedback and manuscript critic certification",
        tools: ["submission-portal", "feedback-tracker", "review-manager"],
      },
      {
        id: "team-collaboration",
        icon: "Users",
        title: "Research Team Collaboration",
        description:
          "Shared workspaces, task assignments, progress tracking for group projects",
        tools: ["workspace-sharing", "task-assignment", "progress-dashboard"],
      },
      {
        id: "defense-prep",
        icon: "Presentation",
        title: "Defense Preparation Suite",
        description:
          "Generate slides, practice with AI Q&A simulator, study with flashcards",
        tools: ["defense-ppt-coach", "qa-simulator", "flashcard-builder"],
      },
      {
        id: "validity-defender",
        icon: "Shield",
        title: "Validity Defender",
        description:
          "Validate instruments, generate defense responses, practice with AI scoring, export PPT slides",
        tools: ["thesis-phases/chapter-3/validity-defender"],
      },
      ],
      toolsCount: 16, // Changed back to original count of 16
      estimatedDuration: "2-4 weeks",
  },
  {
    id: "finalizer",
    phaseNumber: 5,
    phase: "05. Finalizer Pro",
    title: "Thesis Finalizer Pro",
    description: "Polish and integrate all chapters into a cohesive final draft (Pro+Advisor+ Feature)",
    longDescription:
      "Use our advanced multi-agent AI system to refine, harmonize, and finalize your thesis. Upload all chapters to get a cohesive, polished final draft with improved flow, consistent style, and proper formatting. This premium feature is available exclusively for Pro + Advisor and Pro Complete subscribers.",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    icon: "Bot",
    features: [
      {
        id: "multi-agent-processing",
        icon: "Bot",
        title: "Multi-Agent AI Processing",
        description:
          "Six specialized AI agents work simultaneously to refine different aspects of your thesis",
        tools: ["coherence-agent", "style-agent", "citation-agent"],
      },
      {
        id: "chapter-integration",
        icon: "FileText",
        title: "Chapter Integration & Harmonization",
        description: "Seamlessly integrate all chapters with consistent voice, tone, and formatting",
        tools: ["integration-tool", "style-harmonizer", "flow-improver"],
      },
      {
        id: "quality-assurance",
        icon: "Shield",
        title: "Quality Assurance & Polish",
        description:
          "Final quality check with grammar, clarity, and academic tone improvements",
        tools: ["quality-checker", "polish-agent", "final-review"],
      },
    ],
    toolsCount: 9,
    estimatedDuration: "1-2 days",
  },
];

/**
 * Get phase by ID
 */
export function getPhaseById(id: string): ThesisPhase | undefined {
  return THESIS_PHASES.find((phase) => phase.id === id);
}

/**
 * Get phase by number
 */
export function getPhaseByNumber(number: number): ThesisPhase | undefined {
  return THESIS_PHASES.find((phase) => phase.phaseNumber === number);
}

/**
 * Get all phase IDs
 */
export function getAllPhaseIds(): string[] {
  return THESIS_PHASES.map((phase) => phase.id);
}

/**
 * Get phase navigation (previous/next)
 */
export function getPhaseNavigation(phaseId: string) {
  const currentIndex = THESIS_PHASES.findIndex((phase) => phase.id === phaseId);
  if (currentIndex === -1) return { previous: null, next: null };

  return {
    previous: currentIndex > 0 ? THESIS_PHASES[currentIndex - 1] : null,
    next: currentIndex < THESIS_PHASES.length - 1 ? THESIS_PHASES[currentIndex + 1] : null,
  };
}
