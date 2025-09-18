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
      { icon: UserCheck, label: "My Advisor", href: "/settings" },
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
  {
    title: "UI Elements",
    items: [
      { icon: Palette, label: "Colors", href: "/ui-elements/colors" },
      { icon: LayoutTemplate, label: "Layouts & Spacing", href: "/ui-elements/layouts" },
      { icon: Component, label: "Alerts", href: "/ui-elements/alerts" },
      { icon: Component, label: "Avatars", href: "/ui-elements/avatars" },
      { icon: Component, label: "Badges", href: "/ui-elements/badges" },
      { icon: Component, label: "Buttons", href: "/ui-elements/buttons" },
      { icon: Component, label: "Modals", href: "/ui-elements/modals" },
      { icon: BarChart, label: "Charts", href: "/ui-elements/charts" },
      { icon: Component, label: "Form Elements", href: "/ui-elements/form-elements" },
      { icon: Table, label: "Tables", href: "/ui-elements/tables" },
      { icon: Calendar, label: "Calendar", href: "/ui-elements/calendar" },
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
      { icon: CheckSquare, label: "Competency Self-Assessment", href: "/advisor/competency" },
      { icon: BookOpen, label: "Resources", href: "/resources" },
      { icon: University, label: "University Guides", href: "/university-guides" },
      { icon: BookUser, label: "Advisor Guide", href: "/advisor-guide" },
    ],
  },
];