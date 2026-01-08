export type OnboardingStep = {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
  };
  action?: () => void;
  celebrateOnComplete?: boolean;
};

// Student Onboarding Steps
export const studentOnboardingSteps: OnboardingStep[] = [
  {
    element: ".dashboard-nav",
    popover: {
      title: "✨ Welcome to ThesisAI!",
      description: "Your personal thesis coach is ready. Let's explore together and discover powerful AI tools to accelerate your thesis journey.",
      side: "bottom",
      align: "start",
    },
    celebrateOnComplete: false,
  },
  {
    element: ".sidebar-workspace",
    popover: {
      title: "🎯 Your Command Center",
      description: "The Workspace is your hub. Find all your projects, drafts, and AI messages here. Everything you need is just one click away.",
      side: "right",
      align: "start",
    },
    celebrateOnComplete: false,
  },
  {
    element: ".sidebar-conceptualize",
    popover: {
      title: "🧠 01. Conceptualize Phase",
      description: "Start here! Generate topic ideas, identify research gaps, and define your problem statement with AI assistance.",
      side: "right",
      align: "start",
    },
    celebrateOnComplete: false,
  },
  {
    element: ".sidebar-research",
    popover: {
      title: "📚 02. Research Phase",
      description: "Dive deep! Find papers, manage references, analyze articles, and build your methodology with intelligent tools.",
      side: "right",
      align: "start",
    },
    celebrateOnComplete: false,
  },
  {
    element: ".sidebar-write",
    popover: {
      title: "✍️ 03. Write & Refine Phase",
      description: "Polish your work! Use grammar check, paraphraser, originality check, and more to perfect your chapters.",
      side: "right",
      align: "start",
    },
    celebrateOnComplete: false,
  },
  {
    element: ".sidebar-submit",
    popover: {
      title: "🎓 04. Submit & Present Phase",
      description: "Get ready! Finalize your thesis, prepare your defense, and ace your presentation with AI coaching.",
      side: "right",
      align: "start",
    },
    celebrateOnComplete: false,
  },
  {
    element: ".notification-bell",
    popover: {
      title: "🔔 Stay Updated",
      description: "Get real-time notifications about your thesis progress, AI responses, and important updates.",
      side: "bottom",
      align: "end",
    },
    celebrateOnComplete: true,
  },
];

// Advisor Onboarding Steps
export const advisorOnboardingSteps: OnboardingStep[] = [
  {
    element: ".dashboard-nav",
    popover: {
      title: "👋 Welcome, Advisor!",
      description: "You now have access to comprehensive tools to guide and support your students' thesis journey.",
      side: "bottom",
      align: "start",
    },
    celebrateOnComplete: false,
  },
  {
    element: ".sidebar-advisor-workspace",
    popover: {
      title: "📊 Advisor Workspace",
      description: "Monitor dashboards, send messages, and track student progress all in one place.",
      side: "right",
      align: "start",
    },
    celebrateOnComplete: false,
  },
  {
    element: ".sidebar-student-management",
    popover: {
      title: "👥 Student Management",
      description: "View all your students, track their progress, review documents, and communicate effectively.",
      side: "right",
      align: "start",
    },
    celebrateOnComplete: false,
  },
  {
    element: ".sidebar-advisory-tools",
    popover: {
      title: "🛠️ Advisory Tools",
      description: "Create feedback templates, build rubrics, and identify at-risk students for targeted intervention.",
      side: "right",
      align: "start",
    },
    celebrateOnComplete: false,
  },
  {
    element: ".sidebar-analytics",
    popover: {
      title: "📈 Analytics & Reporting",
      description: "Gain insights with comprehensive performance analytics, progress reports, and trend analysis.",
      side: "right",
      align: "start",
    },
    celebrateOnComplete: true,
  },
];

// Critic Onboarding Steps
export const criticOnboardingSteps: OnboardingStep[] = [
  {
    element: ".dashboard-nav",
    popover: {
      title: "👋 Welcome, Critic!",
      description: "You're now equipped with advanced manuscript review and certification tools.",
      side: "bottom",
      align: "start",
    },
    celebrateOnComplete: false,
  },
  {
    element: ".sidebar-critic-workspace",
    popover: {
      title: "📋 Critic Workspace",
      description: "Access your review queue, deadlines, messages, and student list from here.",
      side: "right",
      align: "start",
    },
    celebrateOnComplete: false,
  },
  {
    element: ".sidebar-manuscript-review",
    popover: {
      title: "🔍 Manuscript Review Tools",
      description: "Analyze manuscripts, check grammar, detect plagiarism, and audit citations with precision.",
      side: "right",
      align: "start",
    },
    celebrateOnComplete: false,
  },
  {
    element: ".sidebar-feedback",
    popover: {
      title: "💬 Feedback & Certification",
      description: "Provide structured feedback, track revisions, and issue certificates to qualified students.",
      side: "right",
      align: "start",
    },
    celebrateOnComplete: false,
  },
  {
    element: ".sidebar-critic-analytics",
    popover: {
      title: "💰 Analytics & Earnings",
      description: "Track your review statistics, student performance, and earnings in one dashboard.",
      side: "right",
      align: "start",
    },
    celebrateOnComplete: true,
  },
];

// Get steps based on user role
export function getOnboardingSteps(role?: string): OnboardingStep[] {
  switch (role) {
    case "advisor":
      return advisorOnboardingSteps;
    case "critic":
      return criticOnboardingSteps;
    default:
      return studentOnboardingSteps;
  }
}

// Mini-tour steps for specific features
export const featureToursConfig: Record<string, OnboardingStep[]> = {
  papers: [
    {
      element: ".papers-search",
      popover: {
        title: "🔎 Search Academic Papers",
        description: "Search millions of papers from arXiv and other sources to support your literature review.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: ".papers-filters",
      popover: {
        title: "🎚️ Filter & Sort",
        description: "Use filters to narrow down results by date, author, or relevance to your research.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: ".papers-save",
      popover: {
        title: "💾 Save for Later",
        description: "Bookmark important papers to your reference library and organize them by topic.",
        side: "bottom",
        align: "center",
      },
    },
  ],
  grammarCheck: [
    {
      element: ".grammar-editor",
      popover: {
        title: "✏️ AI-Powered Grammar Check",
        description: "Paste your text and let our AI catch grammar, style, and clarity issues instantly.",
        side: "right",
        align: "start",
      },
    },
    {
      element: ".grammar-suggestions",
      popover: {
        title: "💡 Smart Suggestions",
        description: "Review detailed suggestions with explanations. Click to apply changes instantly.",
        side: "right",
        align: "start",
      },
    },
  ],
  outline: [
    {
      element: ".outline-builder",
      popover: {
        title: "📑 Smart Outline Builder",
        description: "Generate a thesis outline with AI. Customize sections, add notes, and organize your thoughts.",
        side: "right",
        align: "start",
      },
    },
    {
      element: ".outline-export",
      popover: {
        title: "📤 Export & Share",
        description: "Export your outline as PDF or share with your advisor for feedback.",
        side: "right",
        align: "start",
      },
    },
  ],
};
