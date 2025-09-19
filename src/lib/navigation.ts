import {
  BookCheck,
  BookCopy,
  BookMarked,
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
  UserCog,
  BookText as TitleIdeaIcon,
  Languages,
  Baseline,
  University,
  CheckSquare,
  Gift,
  CreditCard,
  UserCheck,
  Component,
  BarChart,
  Table,
  Calendar,
  Palette,
  LayoutTemplate,
  Users,
  Banknote,
  FolderLock,
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
      { icon: FolderLock, label: "Data Management", href: "/data-management" },
      { icon: UserCheck, label: "Manage Advisor", href: "/settings?tab=advisor" },
      { icon: ClipboardCheck, label: "Manage Critic", href: "/settings?tab=critic" },
      { icon: CreditCard, label: "Billing", href: "/settings/billing" },
      { icon: Gift, label: "Referrals", href: "/settings/referrals" },
      { icon: BookOpen, label: "Resources", href: "/resources" },
      { icon: University, label: "University Guides", href: "/university-guides" },
      { icon: BookUser, label: "User Guide", href: "/user-guide" },
    ],
  },
  {
    title: "Pre-Writing",
    items: [
      { icon: BrainCircuit, label: "Topic Ideas", href: "/topic-ideas" },
      { icon: TitleIdeaIcon, label: "Title Generator", href: "/title-generator" },
      { icon: List, label: "Outline", href: "/outline" },
      { icon: FlaskConical, label: "Research", href: "/research" },
    ],
  },
  {
    title: "Writing Helpers",
    items: [
      { icon: ClipboardPen, label: "Methodology", href: "/methodology" },
      { icon: ClipboardCheck, label: "Results", href: "/results" },
      { icon: BookCheck, label: "Conclusion", href: "/conclusion" },
      { icon: Languages, label: "Paraphraser", href: "/paraphraser" },
    ],
  },
  {
    title: "Citation Tools",
    items: [
      { icon: BookMarked, label: "Citations", href: "/citations" },
      { icon: BookCopy, label: "Bibliography", href: "/bibliography" },
    ],
  },
  {
    title: "Review Tools",
    items: [
      { icon: FileText, label: "Title Page", href: "/title-page" },
      { icon: Presentation, label: "Presentation", href: "/presentation" },
      { icon: Lightbulb, label: "Flashcards", href: "/flashcards" },
      { icon: Baseline, label: "Grammar Check", href: "/grammar-check" },
      { icon: ShieldCheck, label: "Originality Check", href: "/originality-check" },
    ],
  },
];

export const adminNavItems: NavItem[] = [{ icon: UserCog, label: "Admin", href: "/admin" }];

export const advisorNavGroups: NavGroup[] = [
  {
    title: "Advisor Workspace",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/advisor" },
      { icon: FileText, label: "Drafts", href: "/drafts" },
      { icon: FolderLock, label: "Data Management", href: "/data-management" },
      { icon: CheckSquare, label: "Competency Self-Assessment", href: "/advisor/competency" },
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