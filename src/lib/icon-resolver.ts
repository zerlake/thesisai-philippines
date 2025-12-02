/**
 * Resolves icon names to lucide-react components
 * Used by components to render icons from icon name strings
 */

import {
  Target,
  Lightbulb,
  BookOpen,
  Network,
  FileText,
  FlaskConical,
  Bot,
  BookCopy,
  University,
  FileCheck,
  Share2,
  Users,
  Presentation,
  Shield,
  LucideIcon,
} from "lucide-react";
import { IconName } from "./thesis-phases";

const iconMap: Record<IconName, LucideIcon> = {
  Target,
  Lightbulb,
  BookOpen,
  Network,
  FileText,
  FlaskConical,
  Bot,
  BookCopy,
  University,
  FileCheck,
  Share2,
  Users,
  Presentation,
  Shield,
};

/**
 * Get a lucide-react icon component by name
 * @param iconName - The name of the icon to retrieve
 * @returns A lucide-react icon component
 */
export function getIcon(iconName: IconName): LucideIcon {
  return iconMap[iconName];
}
