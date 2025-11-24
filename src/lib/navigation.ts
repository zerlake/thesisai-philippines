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
      { icon: FileText, label: "Drafts", href: "/drafts" },
    ],
  },
  {
    title: "Collaboration & Settings",
    items: [
      { icon: Users, label: "Study Groups", href: "/groups" },
      { icon: UserCheck, label: "Advisor Management", href: "/settings?tab=advisor" },
      { icon: ClipboardCheck, label: "Critic Management", href: "/settings?tab=critic" },
      { icon: CreditCard, label: "Billing & Plan", href: "/settings/billing" },
      { icon: Gift, label: "Referrals", href: "/settings/referrals" },
    ],
  },
  {
    title: "Phase 1: Research & Planning",
    items: [
      { icon: BrainCircuit, label: "Topic Ideas", href: "/topic-ideas" },
      { icon: Target, label: "Research Gap Identifier", href: "/research-gap" },
      { icon: Lightbulb, label: "Research Problem Identifier", href: "/research-problem-identifier" },
      { icon: LayoutTemplate, label: "University Format Checker", href: "/university-format-checker" },
      { icon: FlaskConical, label: "Research Assistant", href: "/research" },
    ],
  },
  {
    title: "Phase 2: Writing & Methodology",
    items: [
      { icon: TitleIdeaIcon, label: "Title Generator", href: "/title-generator" },
      { icon: List, label: "Outline Builder", href: "/outline" },
      { icon: ClipboardPen, label: "Methodology Builder", href: "/methodology" },
      { icon: Network, label: "Literature Review", href: "/literature-review" },
      { icon: BookCopy, label: "Reference Manager", href: "/references" },
    ],
  },
  {
    title: "Phase 3: Analysis & Results",
    items: [
      { icon: BarChart, label: "Statistical Analysis", href: "/statistical-analysis" },
      { icon: ClipboardCheck, label: "Results Analyzer", href: "/results" },
      { icon: BookOpen, label: "Research Article Analyzer", href: "/research-article-analyzer" },
      { icon: Target, label: "Variable Mapping", href: "/variable-mapping-tool" },
    ],
  },
  {
    title: "Phase 4: Review & Submission",
    items: [
      { icon: Baseline, label: "Grammar Check", href: "/grammar-check" },
      { icon: Languages, label: "Paraphraser", href: "/paraphraser" },
      { icon: ShieldCheck, label: "Originality Check", href: "/originality-check" },
      { icon: FileText, label: "PDF Document Analysis", href: "/document-analyzer" },
      { icon: BookCheck, label: "Conclusion Writer", href: "/conclusion" },
      { icon: FileText, label: "Title Page", href: "/title-page" },
    ],
  },
  {
    title: "Submission Prep",
    items: [
      { icon: Presentation, label: "Presentation Builder", href: "/presentation" },
      { icon: MessageCircleQuestion, label: "Q&A Simulator", href: "/qa-simulator" },
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

export const advisorNavGroups: NavGroup[] = [
  {
    title: "Advisor Workspace",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/advisor" },
      { icon: FileText, label: "Drafts", href: "/drafts" },
      { icon: CheckSquare, label: "Competency Self-Assessment", href: "/advisor/competency" },
    ],
  },
  {
    title: "Student Management",
    items: [
      { icon: FolderLock, label: "Data Management", href: "/data-management" },
    ],
  },
  {
    title: "Resources",
    items: [
      { icon: BookOpen, label: "Resources", href: "/resources" },
      { icon: University, label: "University Guides", href: "/university-guides" },
      { icon: BookUser, label: "Advisor Guide", href: "/advisor-guide" },
    ],
  },
];

export const criticNavGroups: NavGroup[] = [
  {
    title: "Critic Workspace",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/critic" },
      { icon: Users, label: "My Students", href: "/critic/students" },
      { icon: Banknote, label: "Billing", href: "/critic/billing" },
      { icon: BookOpen, label: "Resources", href: "/resources" },
      { icon: BookUser, label: "Critic Guide", href: "/critic-guide" },
    ],
  },
];