import { Home, FileText, BookOpen, FlaskConical, ClipboardCheck, BookCheck, Lightbulb, Presentation, ShieldCheck, FileSearch, Users, Target, Square, Settings, Folder } from "lucide-react";
import { Document } from "@/types/document";

export interface Command {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
  icon?: React.ReactNode;
  action: () => string; // Return the path to navigate to
  category: 'navigation' | 'tools' | 'documents' | 'actions';
  shortcut?: string;
}

export const commandRegistry: Command[] = [
  // Navigation
  {
    id: 'nav-dashboard',
    label: 'Go to Dashboard',
    keywords: ['home', 'overview'],
    icon: <Home className="w-4 h-4" />,
    action: () => {
      return '/dashboard';
    },
    category: 'navigation'
  },
  {
    id: 'nav-documents',
    label: 'View All Documents',
    keywords: ['docs', 'files', 'papers'],
    icon: <FileText className="w-4 h-4" />,
    action: () => {
      return '/drafts';
    },
    category: 'navigation'
  },
  {
    id: 'nav-settings',
    label: 'Open Settings',
    keywords: ['preferences', 'account', 'profile'],
    icon: <Settings className="w-4 h-4" />,
    action: () => {
      return '/settings';
    },
    category: 'navigation'
  },
  
  // Tools
  {
    id: 'tool-outline',
    label: 'Open Outline Generator',
    description: 'Structure your thesis chapters',
    keywords: ['structure', 'organize', 'chapters'],
    icon: <BookOpen className="w-4 h-4" />,
    action: () => {
      return '/outline';
    },
    category: 'tools'
  },
  {
    id: 'tool-research',
    label: 'Open Research Helper',
    description: 'Find and evaluate papers',
    keywords: ['papers', 'literature', 'search'],
    icon: <FlaskConical className="w-4 h-4" />,
    action: () => {
      return '/research';
    },
    category: 'tools'
  },
  {
    id: 'tool-methodology',
    label: 'Open Methodology Helper',
    description: 'Design your research approach',
    keywords: ['methods', 'research', 'design'],
    icon: <FlaskConical className="w-4 h-4" />,
    action: () => {
      return '/methodology';
    },
    category: 'tools'
  },
  {
    id: 'tool-results',
    label: 'Open Results Helper',
    description: 'Present your research findings',
    keywords: ['findings', 'data', 'analysis'],
    icon: <ClipboardCheck className="w-4 h-4" />,
    action: () => {
      return '/results';
    },
    category: 'tools'
  },
  {
    id: 'tool-conclusion',
    label: 'Open Conclusion Helper',
    description: 'Summarize your work',
    keywords: ['summary', 'end', 'wrap'],
    icon: <BookCheck className="w-4 h-4" />,
    action: () => {
      return '/conclusion';
    },
    category: 'tools'
  },
  {
    id: 'tool-topic-ideas',
    label: 'Open Topic Idea Generator',
    description: 'Brainstorm your research topic',
    keywords: ['ideas', 'brainstorm', 'topics'],
    icon: <Lightbulb className="w-4 h-4" />,
    action: () => {
      return '/topic-ideas';
    },
    category: 'tools'
  },
  {
    id: 'tool-presentation',
    label: 'Open Presentation Maker',
    description: 'Create your slide deck',
    keywords: ['slides', 'deck', 'present'],
    icon: <Presentation className="w-4 h-4" />,
    action: () => {
      return '/presentation';
    },
    category: 'tools'
  },
  {
    id: 'tool-flashcards',
    label: 'Open Flashcards',
    description: 'Study key concepts',
    keywords: ['study', 'cards', 'review'],
    icon: <Lightbulb className="w-4 h-4" />,
    action: () => {
      return '/flashcards';
    },
    category: 'tools'
  },
  {
    id: 'tool-originality',
    label: 'Open Originality Check',
    description: 'Scan for plagiarism',
    keywords: ['plagiarism', 'check', 'scan'],
    icon: <ShieldCheck className="w-4 h-4" />,
    action: () => {
      return '/originality-check';
    },
    category: 'tools'
  },
  {
    id: 'tool-references',
    label: 'Open Reference Manager',
    description: 'Manage your citations',
    keywords: ['citations', 'bibliography', 'references'],
    icon: <FileText className="w-4 h-4" />,
    action: () => {
      return '/references';
    },
    category: 'tools'
  },
  {
    id: 'tool-document-analyzer',
    label: 'Open Document Analyzer',
    description: 'Analyze your documents',
    keywords: ['pdf', 'analyze', 'extract'],
    icon: <FileSearch className="w-4 h-4" />,
    action: () => {
      return '/document-analyzer';
    },
    category: 'tools'
  },
  {
    id: 'tool-research-groups',
    label: 'Open Research Groups',
    description: 'Organize and manage research projects',
    keywords: ['research', 'groups', 'projects', 'organization'],
    icon: <Folder className="w-4 h-4" />,
    action: () => {
      return '/research-groups';
    },
    category: 'tools'
  },
  {
    id: 'tool-literature-review',
    label: 'Open Literature Review Collaboration',
    description: 'Collaborate with your team',
    keywords: ['collaborate', 'literature', 'team'],
    icon: <Users className="w-4 h-4" />,
    action: () => {
      return '/literature-review';
    },
    category: 'tools'
  },
  {
    id: 'tool-variable-mapping',
    label: 'Open Variable Mapping Tool',
    description: 'Map research variables',
    keywords: ['variables', 'mapping', 'research'],
    icon: <Target className="w-4 h-4" />,
    action: () => {
      return '/variable-mapping-tool';
    },
    category: 'tools'
  },
  {
    id: 'tool-format-checker',
    label: 'Open University Format Checker',
    description: 'Check format compliance',
    keywords: ['format', 'compliance', 'style'],
    icon: <Square className="w-4 h-4" />,
    action: () => {
      return '/university-format-checker';
    },
    category: 'tools'
  },
  {
    id: 'tool-problem-identifier',
    label: 'Open Research Problem Identifier',
    description: 'Find research problems',
    keywords: ['problems', 'research', 'identify'],
    icon: <FlaskConical className="w-4 h-4" />,
    action: () => {
      return '/research-problem-identifier';
    },
    category: 'tools'
  },
  
  // Quick Actions
  {
    id: 'action-new-doc',
    label: 'Create New Document',
    keywords: ['new', 'write', 'start'],
    icon: <FileText className="w-4 h-4" />,
    action: () => {
      return '/drafts';
    },
    category: 'actions',
    shortcut: 'Ctrl+N'
  }
];

// Dynamic commands from user data
export const getDynamicCommands = (documents: Document[]): Command[] => {
  return documents.slice(0, 10).map(doc => ({
    id: `doc-${doc.id}`,
    label: doc.title || "Untitled Document",
    description: `${doc.wordCount || 0} words • ${new Date(doc.updated_at || '').toLocaleDateString()}`,
    icon: <FileText className="w-4 h-4" />,
    action: () => {
      return `/drafts/${doc.id}`;
    },
    category: 'documents',
    keywords: [doc.title?.toLowerCase() || '', 'document', 'open', 'edit']
  }));
};