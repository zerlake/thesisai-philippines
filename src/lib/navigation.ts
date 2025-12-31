import {
  BookCheck,
  BookCopy,
  BookOpen,
  BookUser,
  BrainCircuit,
  ClipboardCheck,
  ClipboardPen,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Lightbulb,
  List,
  Presentation,
  ShieldCheck,
  Shield,
  BookText as TitleIdeaIcon,
  Languages,
  Baseline,
  University,
  CheckSquare,
  Gift,
  CreditCard,
  UserCheck,
  BarChart,
  LayoutTemplate,
  Target,
  Users,
  Banknote,
  FolderLock,
  MessageCircleQuestion,
  Network,
  type LucideIcon,
  FileSearch,
  FilePenLine,
  Award,
  History,
  ListTodo,
  FileCheck,
  ClipboardList,
  TrendingUp,
  Clock,
  PenTool,
  AlertTriangle,
  CalendarDays,
  Inbox,
  Star,
  Settings,
  Calendar,
  GraduationCap,
  MessageCircle,
  FolderOpen,
  Activity,
  Zap,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const studentNavGroups: NavGroup[] = [
  {
    title: "Workspace",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: FolderOpen, label: "My Projects", href: "/projects" },
      { icon: MessageCircleQuestion, label: "Messages", href: "/chat" },
      { icon: FileText, label: "Drafts", href: "/drafts" },
      { icon: Activity, label: "AI Usage", href: "/ai-usage" },
    ],
  },
  {
    title: "01. Conceptualize - Research Planning",
    items: [
      { icon: BrainCircuit, label: "Topic Ideas", href: "/topic-ideas" },
      { icon: Target, label: "Research Gap Identifier", href: "/research-gap" },
      { icon: Lightbulb, label: "Research Problem Identifier", href: "/research-problem-identifier" },
      { icon: FlaskConical, label: "Research Assistant", href: "/research" },
      { icon: LayoutTemplate, label: "University Format Checker", href: "/university-format-checker" },
    ],
  },
  {
    title: "02. Research - Literature & Analysis",
    items: [
      { icon: Network, label: "Literature Review", href: "/literature-review" },
      { icon: BookOpen, label: "Find Papers", href: "/papers" },
      { icon: BookCopy, label: "Reference Manager", href: "/references" },
      { icon: FlaskConical, label: "Methodology Builder", href: "/methodology" },
      { icon: BookOpen, label: "Research Article Analyzer", href: "/research-article-analyzer" },
      { icon: Target, label: "Variable Mapping", href: "/variable-mapping-tool" },
    ],
  },
  {
    title: "03. Write & Refine - Content Creation",
    items: [
      { icon: TitleIdeaIcon, label: "Title Generator", href: "/title-generator" },
      { icon: List, label: "Outline Builder", href: "/outline" },
      { icon: Baseline, label: "Grammar Check", href: "/grammar-check" },
      { icon: Languages, label: "Paraphraser", href: "/paraphraser" },
      { icon: ShieldCheck, label: "Originality Check", href: "/originality-check" },
      { icon: FileText, label: "PDF Document Analysis", href: "/document-analyzer" },
    ],
  },
  {
    title: "04. Submit & Present - Finalization & Defense",
    items: [
      { icon: BookCheck, label: "Conclusion Writer", href: "/conclusion" },
      { icon: FileText, label: "Title Page", href: "/title-page" },
      { icon: BarChart, label: "Statistical Analysis", href: "/statistical-analysis" },
      { icon: ClipboardCheck, label: "Results Analyzer", href: "/results" },
    ],
  },
  {
    title: "Submission Prep",
    items: [
      { icon: Shield, label: "Validity Defender", href: "/thesis-phases/chapter-3/validity-defender" },
      { icon: Presentation, label: "Defense PPT Coach", href: "/defense-ppt-coach" },
      { icon: Presentation, label: "Presentation Builder", href: "/presentation" },
      { icon: MessageCircleQuestion, label: "Q&A Simulator", href: "/qa-simulator" },
      { icon: MessageCircleQuestion, label: "General Q&A Trainer", href: "/general-qa-framework-trainer" },
      { icon: MessageCircleQuestion, label: "Proposal Q&A Trainer", href: "/proposal-qa-framework-trainer" },
      { icon: MessageCircleQuestion, label: "Defense Q&A Trainer", href: "/defense-qa-framework-trainer" },
      { icon: Lightbulb, label: "Flashcards", href: "/flashcards" },
      { icon: BarChart, label: "Writing Analytics", href: "/analytics" },
    ],
  },
  {
    title: "Resources & Support",
    items: [
      { icon: BookOpen, label: "Resources", href: "/resources" },
      { icon: University, label: "University Guides", href: "/university-guides" },
      { icon: BookUser, label: "User Guide", href: "/user-guide" },
      { icon: FolderLock, label: "Data Management", href: "/data-management" },
    ],
  },
];

export const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: University, label: "Institutions", href: "/admin/institutions" },
  { icon: MessageCircleQuestion, label: "Testimonials", href: "/admin/testimonials" },
  { icon: Banknote, label: "Payouts", href: "/admin/payouts" },
  { icon: Network, label: "MCP Servers", href: "/admin/mcp-servers" },
];

export const adminNavGroups: NavGroup[] = [
  {
    title: "Admin Workspace",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
      { icon: Users, label: "User Management", href: "/admin/users" },
      { icon: TrendingUp, label: "System Analytics", href: "/admin/analytics" },
      { icon: Settings, label: "System Settings", href: "/admin/settings" },
    ],
  },
  {
    title: "Content Management",
    items: [
      { icon: University, label: "Institutions", href: "/admin/institutions" },
      { icon: MessageCircleQuestion, label: "Testimonials", href: "/admin/testimonials" },
      { icon: BookOpen, label: "User Onboarding", href: "/admin/user-onboarding" },
      { icon: FileText, label: "Documentation", href: "/admin/wiki" },
    ],
  },
  {
    title: "Financial Management",
    items: [
      { icon: Banknote, label: "Payout Requests", href: "/admin/payouts" },
      { icon: CreditCard, label: "Subscriptions", href: "/admin/subscriptions" },
      { icon: Gift, label: "Referral Program", href: "/admin/referrals" },
    ],
  },
  {
    title: "AI & System",
    items: [
      { icon: Network, label: "MCP Servers", href: "/admin/mcp-servers" },
      { icon: BrainCircuit, label: "AI Pipeline", href: "/admin/ai" },
      { icon: FlaskConical, label: "Paper Search", href: "/admin/paper-search" },
      { icon: Shield, label: "Security Logs", href: "/admin/security" },
    ],
  },
];

export const advisorNavGroups: NavGroup[] = [
  {
    title: "Advisor Workspace",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/advisor" },
      { icon: MessageCircleQuestion, label: "Messages", href: "/advisor/messages" },
      { icon: FileText, label: "Drafts", href: "/advisor/drafts" },
      { icon: CheckSquare, label: "Competency Self-Assessment", href: "/advisor/competency" },
    ],
  },
  {
    title: "Student Management",
    items: [
      { icon: Users, label: "My Students", href: "/advisor/students" },
      { icon: BookOpen, label: "Student Progress", href: "/advisor/students/analytics" },
      { icon: FileText, label: "Document Reviews", href: "/advisor/students/documents" },
      { icon: MessageCircleQuestion, label: "Communication Hub", href: "/advisor/students/communication" },
      { icon: Target, label: "Milestone Tracking", href: "/advisor/students/milestones" },
    ],
  },
  {
    title: "Advisory Tools",
    items: [
      { icon: ClipboardCheck, label: "Feedback Templates", href: "/advisor/feedback/templates" },
      { icon: FilePenLine, label: "Rubric Builder", href: "/advisor/feedback/rubrics" },
      { icon: ShieldCheck, label: "Quality Assurance", href: "/advisor/feedback/quality" },
      { icon: AlertTriangle, label: "At-Risk Students", href: "/advisor/students/at-risk" },
      { icon: Calendar, label: "Appointment Scheduler", href: "/advisor/meetings" },
    ],
  },
  {
    title: "Analytics & Reporting",
    items: [
      { icon: BarChart, label: "Performance Analytics", href: "/advisor/analytics" },
      { icon: FileText, label: "Progress Reports", href: "/advisor/reports" },
      { icon: TrendingUp, label: "Trend Analysis", href: "/advisor/analytics/trends" },
      { icon: Clock, label: "Timeline Tracking", href: "/advisor/analytics/timeline" },
    ],
  },
  {
    title: "Institutional Management",
    items: [
      { icon: Settings, label: "Department Settings", href: "/advisor/institutional" },
      { icon: Users, label: "Student Assignments", href: "/advisor/institutional/students" },
      { icon: BookOpen, label: "Thesis Guidelines", href: "/advisor/institutional/guidelines" },
      { icon: FileCheck, label: "Compliance Check", href: "/advisor/institutional/compliance" },
    ],
  },
  {
    title: "Resources",
    items: [
      { icon: BookUser, label: "Advisor Guide", href: "/advisor/resources/guide" },
      { icon: GraduationCap, label: "Training Materials", href: "/advisor/resources/training" },
      { icon: FileText, label: "Documentation", href: "/advisor/resources/docs" },
      { icon: MessageCircle, label: "Support", href: "/advisor/resources/support" },
    ],
  },
];

export const criticNavGroups: NavGroup[] = [
  {
    title: "Critic Workspace",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/critic" },
      { icon: MessageCircleQuestion, label: "Messages", href: "/critic/chat" },
      { icon: Users, label: "My Students", href: "/critic/students" },
      { icon: Inbox, label: "Review Queue", href: "/critic/review-queue" },
      { icon: CalendarDays, label: "Deadlines", href: "/critic/deadlines" },
    ],
  },
  {
    title: "01. Manuscript Review",
    items: [
      { icon: FileSearch, label: "Manuscript Analyzer", href: "/critic/manuscript-analyzer" },
      { icon: Baseline, label: "Grammar & Style Checker", href: "/critic/grammar-checker" },
      { icon: ShieldCheck, label: "Plagiarism Detector", href: "/critic/plagiarism-check" },
      { icon: BookCopy, label: "Citation Auditor", href: "/critic/citation-auditor" },
      { icon: AlertTriangle, label: "Academic Integrity", href: "/critic/integrity-check" },
      { icon: LayoutTemplate, label: "Format Compliance", href: "/critic/format-checker" },
    ],
  },
  {
    title: "02. Feedback & Certification",
    items: [
      { icon: FilePenLine, label: "Feedback Templates", href: "/critic/feedback-templates" },
      { icon: ClipboardList, label: "Certification Checklist", href: "/critic/certification-checklist" },
      { icon: History, label: "Revision Tracker", href: "/critic/revision-tracker" },
      { icon: FileCheck, label: "Review History", href: "/critic/review-history" },
      { icon: ListTodo, label: "Batch Review", href: "/critic/batch-review" },
      { icon: Award, label: "Issue Certificate", href: "/critic/issue-certificate" },
    ],
  },
  {
    title: "03. Critic Resources",
    items: [
      { icon: ClipboardCheck, label: "Evaluation Rubrics", href: "/critic/rubrics" },
      { icon: BookOpen, label: "Best Practices Guide", href: "/critic/best-practices" },
      { icon: AlertTriangle, label: "Common Issues Library", href: "/critic/common-issues" },
      { icon: University, label: "Format Specifications", href: "/critic/format-specs" },
      { icon: PenTool, label: "Communication Templates", href: "/critic/comm-templates" },
      { icon: BookUser, label: "Critic Guide", href: "/critic-guide" },
    ],
  },
  {
    title: "04. Analytics & Performance",
    items: [
      { icon: BarChart, label: "Review Statistics", href: "/critic/statistics" },
      { icon: TrendingUp, label: "Student Performance", href: "/critic/student-performance" },
      { icon: Banknote, label: "Earnings Report", href: "/critic/billing" },
      { icon: Star, label: "Peer Comparison", href: "/critic/peer-comparison" },
      { icon: Clock, label: "Turnaround Metrics", href: "/critic/turnaround" },
    ],
  },
];
