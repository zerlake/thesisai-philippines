import {
  LayoutDashboard,
  FileText,
  BookCopy,
  FlaskConical,
  Sigma,
  FileCheck2,
  Lightbulb,
  FileClock,
  Users,
  BookUser,
  Shield,
  UserCog,
  University,
  CreditCard,
  Gift,
  List,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

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
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Drafts", href: "/drafts", icon: FileText },
      { label: "Resources", href: "/resources", icon: BookCopy },
    ],
  },
  {
    title: "Pre-Writing",
    items: [
      { label: "Topic Ideas", href: "/tools/topic-ideas", icon: Lightbulb },
      { label: "Outline Generator", href: "/tools/outline-generator", icon: List },
    ],
  },
  {
    title: "Writing Helpers",
    items: [
      { label: "Methodology", href: "/tools/methodology", icon: FlaskConical },
      { label: "Results", href: "/tools/results", icon: Sigma },
      { label: "Conclusion", href: "/tools/conclusion", icon: FileCheck2 },
    ],
  },
  {
    title: "Review Tools",
    items: [
      { label: "Originality Checker", href: "/tools/originality-checker", icon: Shield },
      { label: "Grammar Checker", href: "/tools/grammar-checker", icon: FileClock },
    ],
  },
];

export const advisorNavGroups: NavGroup[] = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", href: "/advisor", icon: LayoutDashboard },
      { label: "Student Drafts", href: "/advisor/drafts", icon: FileText },
    ],
  },
  {
    title: "Mentorship Tools",
    items: [
      { label: "My Students", href: "/advisor/students", icon: Users },
      { label: "Advisor Guide", href: "/advisor/guide", icon: BookUser },
      { label: "Competency Assessment", href: "/advisor/assessment", icon: UserCog },
    ],
  },
];

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
];