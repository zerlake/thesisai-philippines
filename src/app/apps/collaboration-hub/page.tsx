// src/app/apps/collaboration-hub/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Added Label import
import {
  Users,
  MessageSquare,
  FileText,
  Share2,
  Mail,
  Calendar,
  Target,
  CheckCircle,
  AlertCircle,
  Edit3,
  Eye,
  Download,
  Upload,
  GitBranch,
  GitPullRequest,
  UserPlus,
  Hash,
  Bell,
  Settings,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  MessageCircle,
  UserCheck,
  AtSign,
  Send,
  RotateCcw,
  Clock,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  History,
  FileCheck,
  FilePen,
  Play,
  Pause,
  RefreshCw,
  Archive,
  Trash2,
  Copy,
  ExternalLink,
  type LucideIcon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

// Sample document contents
const SAMPLE_CONTENTS: Record<string, string> = {
  'doc-1': `# Thesis Outline

## Chapter 1: Introduction
### 1.1 Background of the Study
The rapid advancement of artificial intelligence has transformed various sectors of society, including education. This thesis explores the integration of AI-powered tools in academic writing and thesis development.

### 1.2 Statement of the Problem
Despite the proliferation of AI writing assistants, there remains a gap in understanding how these tools can be effectively integrated into the thesis writing process while maintaining academic integrity.

### 1.3 Objectives of the Study
1. To evaluate the effectiveness of AI-assisted writing tools in thesis development
2. To identify best practices for integrating AI tools in academic writing
3. To develop a framework for ethical AI usage in thesis writing

### 1.4 Significance of the Study
This research contributes to the growing body of knowledge on educational technology and provides practical guidelines for students, educators, and institutions.

## Chapter 2: Review of Related Literature
(To be completed)

## Chapter 3: Methodology
(To be completed)

## Chapter 4: Results and Discussion
(To be completed)

## Chapter 5: Summary, Conclusions, and Recommendations
(To be completed)`,

  'doc-2': `# Literature Review

## 2.1 Introduction
This chapter presents a comprehensive review of literature related to AI-assisted academic writing, educational technology, and thesis development processes.

## 2.2 Theoretical Framework
### 2.2.1 Constructivist Learning Theory
Constructivism posits that learners construct knowledge through experiences and reflection. AI tools can serve as scaffolding mechanisms that support this construction process (Vygotsky, 1978).

### 2.2.2 Technology Acceptance Model (TAM)
Davis (1989) proposed that perceived usefulness and perceived ease of use determine technology adoption. This model provides a lens for understanding student acceptance of AI writing tools.

## 2.3 Review of Related Studies
### 2.3.1 AI in Education
Recent studies have shown significant improvements in student writing quality when AI tools are used appropriately (Smith et al., 2023; Johnson & Williams, 2024).

### 2.3.2 Academic Integrity Concerns
Concerns about plagiarism and authenticity have been raised by several researchers (Chen & Rodriguez, 2023). However, proper guidelines and education can mitigate these concerns.

### 2.3.3 Student Perceptions
Students generally view AI writing assistants positively, citing improved efficiency and reduced anxiety (Thompson, 2024).

## 2.4 Synthesis
The literature reveals both opportunities and challenges in integrating AI tools into academic writing. A balanced approach that emphasizes ethical usage while leveraging technological benefits appears most promising.

## 2.5 Research Gap
While existing studies have examined AI tools in general writing contexts, few have specifically focused on thesis development in graduate education, highlighting the need for this research.`,

  'doc-3': `# Methodology

## 3.1 Research Design
This study employs a mixed-methods research design, combining quantitative surveys with qualitative interviews to provide a comprehensive understanding of AI tool usage in thesis writing.

## 3.2 Research Locale
The study will be conducted at selected universities in the Philippines, focusing on graduate programs in various disciplines.

## 3.3 Participants
### 3.3.1 Population
Graduate students currently enrolled in thesis-writing courses across partner institutions.

### 3.3.2 Sample Size
Using Slovin's formula with a 5% margin of error:
n = N / (1 + Ne²)

Target sample: 300 participants

### 3.3.3 Sampling Technique
Stratified random sampling will be employed to ensure representation across different:
- Academic disciplines
- Year levels
- Institutions

## 3.4 Research Instruments
### 3.4.1 Survey Questionnaire
A validated survey instrument measuring:
- AI tool usage frequency
- Perceived usefulness
- Academic integrity awareness
- Writing quality self-assessment

### 3.4.2 Interview Guide
Semi-structured interviews exploring:
- Personal experiences with AI tools
- Challenges encountered
- Recommendations for improvement

## 3.5 Data Collection Procedure
(To be detailed)

## 3.6 Data Analysis
- Quantitative: SPSS for descriptive and inferential statistics
- Qualitative: Thematic analysis using NVivo

## 3.7 Ethical Considerations
- Informed consent
- Anonymity and confidentiality
- IRB approval`
};

// Document to page mapping
const DOCUMENT_ROUTES: Record<string, { editor: string; phase: string; draft: string }> = {
  'doc-1': {
    editor: '/thesis-phases/chapter-1/editor',
    phase: '/thesis-phases/chapter-1',
    draft: '/drafts/thesis-outline'
  },
  'doc-2': {
    editor: '/thesis-phases/chapter-2/editor',
    phase: '/thesis-phases/chapter-2',
    draft: '/drafts/literature-review'
  },
  'doc-3': {
    editor: '/thesis-phases/chapter-3/editor',
    phase: '/thesis-phases/chapter-3',
    draft: '/drafts/methodology'
  }
};

// Types for dynamic action buttons
type DocumentStatus = 'draft' | 'in-progress' | 'review' | 'approved' | 'revision-needed' | 'submitted' | 'archived';
type DocumentPermission = 'view' | 'comment' | 'edit' | 'admin';

interface DocumentAction {
  id: string;
  label: string;
  icon: LucideIcon;
  variant: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost';
  priority: number; // Lower number = higher priority (shown first)
  action: () => void;
  tooltip?: string;
}

interface Document {
  id: string;
  title: string;
  author: string;
  lastEdited: string;
  lastEditor: string;
  permissions: DocumentPermission;
  commentsCount: number;
  status: DocumentStatus;
  progress: number;
  hasUnreadComments?: boolean;
  hasPendingApproval?: boolean;
  isOverdue?: boolean;
  reviewDeadline?: string;
  assignedReviewer?: string;
  version?: number;
}

// Function to generate dynamic action buttons based on document state
function getDocumentActions(
  document: Document,
  router: ReturnType<typeof useRouter>,
  handlers: {
    onView: (doc: Document) => void;
    onSubmitForReview: (doc: Document) => void;
    onApprove: (doc: Document) => void;
    onRequestChanges: (doc: Document) => void;
    onArchive: (doc: Document) => void;
    onRestore: (doc: Document) => void;
    onDuplicate: (doc: Document) => void;
    onDownload: (doc: Document) => void;
  }
): DocumentAction[] {
  const actions: DocumentAction[] = [];
  const route = DOCUMENT_ROUTES[document.id];

  // Always show View action
  actions.push({
    id: 'view',
    label: 'View',
    icon: Eye,
    variant: 'outline',
    priority: 10,
    action: () => handlers.onView(document),
    tooltip: 'Preview document content'
  });

  // Status-based actions
  switch (document.status) {
    case 'draft':
      // Draft documents can be edited (if permission allows) or submitted for review
      if (document.permissions === 'edit' || document.permissions === 'admin') {
        actions.push({
          id: 'edit',
          label: 'Edit Draft',
          icon: FilePen,
          variant: 'default',
          priority: 1,
          action: () => route && router.push(route.editor),
          tooltip: 'Continue editing this draft'
        });
        actions.push({
          id: 'submit-review',
          label: 'Submit for Review',
          icon: Send,
          variant: 'secondary',
          priority: 2,
          action: () => handlers.onSubmitForReview(document),
          tooltip: 'Submit this draft for advisor review'
        });
      }
      if (document.progress < 100) {
        actions.push({
          id: 'continue',
          label: 'Continue Writing',
          icon: Play,
          variant: 'default',
          priority: 1,
          action: () => route && router.push(route.editor),
          tooltip: `${100 - document.progress}% remaining`
        });
      }
      break;

    case 'in-progress':
      // In-progress documents: continue editing, pause, or submit
      if (document.permissions === 'edit' || document.permissions === 'admin') {
        actions.push({
          id: 'continue',
          label: 'Continue',
          icon: Target,
          variant: 'default',
          priority: 1,
          action: () => route && router.push(route.editor),
          tooltip: `Continue editing (${document.progress}% complete)`
        });
        if (document.progress >= 80) {
          actions.push({
            id: 'submit-review',
            label: 'Submit for Review',
            icon: Send,
            variant: 'secondary',
            priority: 2,
            action: () => handlers.onSubmitForReview(document),
            tooltip: 'Ready for advisor feedback'
          });
        }
      }
      if (document.permissions === 'comment') {
        actions.push({
          id: 'add-comment',
          label: 'Add Comment',
          icon: MessageCircle,
          variant: 'secondary',
          priority: 2,
          action: () => route && router.push(`${route.phase}?tab=comments`),
          tooltip: 'Leave feedback on this document'
        });
      }
      break;

    case 'review':
      // Under review: view comments, approve/request changes (for reviewers)
      if (document.permissions === 'admin' || document.assignedReviewer) {
        actions.push({
          id: 'approve',
          label: 'Approve',
          icon: ThumbsUp,
          variant: 'default',
          priority: 1,
          action: () => handlers.onApprove(document),
          tooltip: 'Approve this document'
        });
        actions.push({
          id: 'request-changes',
          label: 'Request Changes',
          icon: RotateCcw,
          variant: 'secondary',
          priority: 2,
          action: () => handlers.onRequestChanges(document),
          tooltip: 'Send back for revisions'
        });
      }
      actions.push({
        id: 'view-comments',
        label: document.hasUnreadComments ? 'View Comments (New)' : 'View Comments',
        icon: MessageCircle,
        variant: document.hasUnreadComments ? 'default' : 'outline',
        priority: 3,
        action: () => route && router.push(`${route.phase}?tab=comments`),
        tooltip: `${document.commentsCount} comments`
      });
      if (document.isOverdue) {
        actions.push({
          id: 'overdue-alert',
          label: 'Overdue',
          icon: AlertCircle,
          variant: 'destructive',
          priority: 0,
          action: () => route && router.push(`${route.phase}?tab=review`),
          tooltip: 'Review deadline has passed'
        });
      }
      break;

    case 'revision-needed':
      // Needs revision: edit and resubmit
      if (document.permissions === 'edit' || document.permissions === 'admin') {
        actions.push({
          id: 'revise',
          label: 'Make Revisions',
          icon: Edit3,
          variant: 'default',
          priority: 1,
          action: () => route && router.push(route.editor),
          tooltip: 'Address requested changes'
        });
        actions.push({
          id: 'view-feedback',
          label: 'View Feedback',
          icon: MessageCircle,
          variant: 'secondary',
          priority: 2,
          action: () => route && router.push(`${route.phase}?tab=comments`),
          tooltip: 'Review change requests'
        });
        actions.push({
          id: 'resubmit',
          label: 'Resubmit',
          icon: RefreshCw,
          variant: 'outline',
          priority: 3,
          action: () => handlers.onSubmitForReview(document),
          tooltip: 'Submit revised version for review'
        });
      }
      break;

    case 'approved':
      // Approved: download, archive, or view history
      actions.push({
        id: 'download',
        label: 'Download',
        icon: Download,
        variant: 'default',
        priority: 1,
        action: () => handlers.onDownload(document),
        tooltip: 'Download approved version'
      });
      actions.push({
        id: 'view-history',
        label: 'Version History',
        icon: History,
        variant: 'outline',
        priority: 3,
        action: () => route && router.push(`${route.phase}?tab=history`),
        tooltip: `Version ${document.version || 1}`
      });
      if (document.permissions === 'admin') {
        actions.push({
          id: 'archive',
          label: 'Archive',
          icon: Archive,
          variant: 'outline',
          priority: 4,
          action: () => handlers.onArchive(document),
          tooltip: 'Move to archives'
        });
      }
      break;

    case 'submitted':
      // Submitted and waiting: show pending status, allow recall
      actions.push({
        id: 'pending',
        label: 'Pending Review',
        icon: Clock,
        variant: 'secondary',
        priority: 1,
        action: () => {},
        tooltip: 'Awaiting reviewer feedback'
      });
      if (document.permissions === 'edit' || document.permissions === 'admin') {
        actions.push({
          id: 'recall',
          label: 'Recall',
          icon: RotateCcw,
          variant: 'outline',
          priority: 2,
          action: () => handlers.onRestore(document),
          tooltip: 'Withdraw submission for further edits'
        });
      }
      break;

    case 'archived':
      // Archived: restore or view
      actions.push({
        id: 'restore',
        label: 'Restore',
        icon: RotateCcw,
        variant: 'default',
        priority: 1,
        action: () => handlers.onRestore(document),
        tooltip: 'Restore from archive'
      });
      actions.push({
        id: 'view-history',
        label: 'View History',
        icon: History,
        variant: 'outline',
        priority: 2,
        action: () => route && router.push(`${route.phase}?tab=history`),
        tooltip: 'View document history'
      });
      break;
  }

  // Permission-based additional actions
  if (document.permissions === 'admin') {
    actions.push({
      id: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      variant: 'ghost',
      priority: 8,
      action: () => handlers.onDuplicate(document),
      tooltip: 'Create a copy of this document'
    });
  }

  // Always allow download for non-draft documents
  if (document.status !== 'draft' && !actions.find(a => a.id === 'download')) {
    actions.push({
      id: 'download',
      label: 'Export',
      icon: Download,
      variant: 'ghost',
      priority: 9,
      action: () => handlers.onDownload(document),
      tooltip: 'Download as PDF'
    });
  }

  // Sort by priority and return
  return actions.sort((a, b) => a.priority - b.priority);
}

export default function CollaborationHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('share');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string | undefined>(undefined);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [shareEmail, setShareEmail] = useState('');
  const [viewingDocument, setViewingDocument] = useState<any | null>(null);
  const [editedContent, setEditedContent] = useState('');

  // Sample data initialization
  useEffect(() => {
    setCollaborators([
      {
        id: '1',
        name: 'Dr. Maria Santos',
        email: 'maria.santos@thesisai.edu',
        role: 'Advisor',
        status: 'active',
        lastActive: '2025-01-15T10:30:00Z',
        avatar: '/avatars/maria.jpg'
      },
      {
        id: '2',
        name: 'Prof. John Smith',
        email: 'john.smith@thesisai.edu',
        role: 'Committee Member',
        status: 'offline',
        lastActive: '2025-01-14T18:45:00Z',
        avatar: '/avatars/john.jpg'
      },
      {
        id: '3',
        name: 'Jane Doe',
        email: 'jane.doe@thesisai.edu',
        role: 'Peer Reviewer',
        status: 'active',
        lastActive: '2025-01-15T11:15:00Z',
        avatar: '/avatars/jane.jpg'
      }
    ]);

    setDocuments([
      {
        id: 'doc-1',
        title: 'Thesis Outline',
        author: 'Me',
        lastEdited: '2025-01-15T09:30:00Z',
        lastEditor: 'You',
        permissions: 'edit',
        commentsCount: 3,
        status: 'in-progress',
        progress: 85,
        hasUnreadComments: true,
        hasPendingApproval: false,
        isOverdue: false,
        version: 3
      },
      {
        id: 'doc-2',
        title: 'Literature Review',
        author: 'Me',
        lastEdited: '2025-01-14T16:45:00Z',
        lastEditor: 'Dr. Maria Santos',
        permissions: 'comment',
        commentsCount: 7,
        status: 'review',
        progress: 100,
        hasUnreadComments: true,
        hasPendingApproval: true,
        isOverdue: false,
        reviewDeadline: '2025-01-20T00:00:00Z',
        assignedReviewer: 'Dr. Maria Santos',
        version: 2
      },
      {
        id: 'doc-3',
        title: 'Methodology Chapter',
        author: 'Me',
        lastEdited: '2025-01-13T14:20:00Z',
        lastEditor: 'You',
        permissions: 'edit',
        commentsCount: 1,
        status: 'draft',
        progress: 45,
        hasUnreadComments: false,
        hasPendingApproval: false,
        isOverdue: false,
        version: 1
      }
    ]);

    setMessages([
      {
        id: 'msg-1',
        sender: 'Dr. Maria Santos',
        content: 'The literature review looks good, but consider adding more recent sources from 2024.',
        timestamp: '2025-01-15T08:30:00Z',
        type: 'comment',
        documentId: 'doc-2'
      },
      {
        id: 'msg-2',
        sender: 'Jane Doe',
        content: 'I reviewed the methodology section and have some suggestions for the sample size calculation.',
        timestamp: '2025-01-14T15:45:00Z',
        type: 'review',
        documentId: 'doc-3'
      },
      {
        id: 'msg-3',
        sender: 'Prof. John Smith',
        content: 'Approved the thesis outline with minor changes to section 3.4.',
        timestamp: '2025-01-14T12:15:00Z',
        type: 'approval',
        documentId: 'doc-1'
      }
    ]);

    setNotifications([
      {
        id: 'notif-1',
        type: 'comment',
        title: 'New comment on Literature Review',
        description: 'Dr. Maria Santos commented on your document',
        timestamp: '2025-01-15T08:30:00Z',
        read: false
      },
      {
        id: 'notif-2',
        type: 'mention',
        title: 'You were mentioned in a discussion',
        description: 'Jane Doe mentioned you in a thread about methodology',
        timestamp: '2025-01-14T16:20:00Z',
        read: true
      },
      {
        id: 'notif-3',
        type: 'approval',
        title: 'Thesis Outline Approved',
        description: 'Prof. John Smith approved your thesis outline',
        timestamp: '2025-01-14T12:15:00Z',
        read: false
      }
    ]);
  }, []);

  const handleShareDocument = async () => {
    if (!selectedDocument || !shareEmail) {
      return;
    }

    // In a real implementation, this would send an invitation via email
    console.log(`Sharing document ${selectedDocument} with ${shareEmail}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setShareEmail('');
    alert(`Document shared with ${shareEmail} successfully!`);
  };

  const addComment = async () => {
    if (!selectedDocument || !newComment.trim()) {
      return;
    }

    const comment = {
      id: `comment-${Date.now()}`,
      documentId: selectedDocument,
      author: 'Current User', // Would come from auth context
      content: newComment,
      timestamp: new Date().toISOString(),
      type: 'comment'
    };

    setMessages([comment, ...messages]);
    setNewComment('');

    // In a real implementation, this would be sent to the backend
  };

  const toggleNotificationRead = (notificationId: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: !notif.read } : notif
    ));
  };

  // Dynamic action handlers for document reviews
  const documentActionHandlers = {
    onView: (doc: Document) => {
      setViewingDocument(doc);
      setEditedContent(SAMPLE_CONTENTS[doc.id] || '');
    },
    onSubmitForReview: (doc: Document) => {
      setDocuments(documents.map(d =>
        d.id === doc.id ? { ...d, status: 'submitted' as DocumentStatus } : d
      ));
      setNotifications([
        {
          id: `notif-${Date.now()}`,
          type: 'submission',
          title: `${doc.title} submitted for review`,
          description: 'Your document has been submitted and is awaiting reviewer feedback',
          timestamp: new Date().toISOString(),
          read: false
        },
        ...notifications
      ]);
    },
    onApprove: (doc: Document) => {
      setDocuments(documents.map(d =>
        d.id === doc.id ? { ...d, status: 'approved' as DocumentStatus, version: (d.version || 1) + 1 } : d
      ));
      setNotifications([
        {
          id: `notif-${Date.now()}`,
          type: 'approval',
          title: `${doc.title} has been approved`,
          description: 'The document has been approved and is ready for final submission',
          timestamp: new Date().toISOString(),
          read: false
        },
        ...notifications
      ]);
    },
    onRequestChanges: (doc: Document) => {
      setDocuments(documents.map(d =>
        d.id === doc.id ? { ...d, status: 'revision-needed' as DocumentStatus } : d
      ));
      setNotifications([
        {
          id: `notif-${Date.now()}`,
          type: 'revision',
          title: `Changes requested for ${doc.title}`,
          description: 'Your reviewer has requested changes to this document',
          timestamp: new Date().toISOString(),
          read: false
        },
        ...notifications
      ]);
    },
    onArchive: (doc: Document) => {
      setDocuments(documents.map(d =>
        d.id === doc.id ? { ...d, status: 'archived' as DocumentStatus } : d
      ));
    },
    onRestore: (doc: Document) => {
      // Restore to previous status or draft
      const previousStatus = doc.status === 'archived' ? 'draft' : 'in-progress';
      setDocuments(documents.map(d =>
        d.id === doc.id ? { ...d, status: previousStatus as DocumentStatus } : d
      ));
    },
    onDuplicate: (doc: Document) => {
      const newDoc: Document = {
        ...doc,
        id: `doc-${Date.now()}`,
        title: `${doc.title} (Copy)`,
        status: 'draft',
        lastEdited: new Date().toISOString(),
        lastEditor: 'You',
        commentsCount: 0,
        hasUnreadComments: false,
        version: 1
      };
      setDocuments([...documents, newDoc]);
    },
    onDownload: (doc: Document) => {
      // Simulate download
      const content = SAMPLE_CONTENTS[doc.id] || `# ${doc.title}\n\nContent not available.`;
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title.toLowerCase().replace(/\s+/g, '-')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Collaboration Hub</h1>
          <p className="text-muted-foreground">
            Share, discuss, and collaborate on your thesis with advisors and peers
          </p>
        </div>

        <Tabs defaultValue="share" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[700px]">
            <TabsTrigger value="share">Share Documents</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share Thesis Documents
                </CardTitle>
                <CardDescription>
                  Share your thesis components with advisors and collaborators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="document-select">Select Document</Label>
                      <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                        <SelectTrigger id="document-select">
                          <SelectValue placeholder="Choose a document to share" />
                        </SelectTrigger>
                        <SelectContent>
                          {documents.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>
                              {doc.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="email">Invite Collaborator</Label>
                      <div className="flex gap-2">
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          value={shareEmail}
                          onChange={(e) => setShareEmail(e.target.value)}
                        />
                        <Button onClick={handleShareDocument} disabled={!selectedDocument || !shareEmail}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Invite
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className="font-medium mb-2">Permissions</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">View Only</Badge>
                        <Badge variant="outline">Comment</Badge>
                        <Badge>Can Edit</Badge>
                        <Badge variant="destructive">Admin</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Recently Shared Documents</h3>
                    <div className="space-y-3">
                      {documents.slice(0, 3).map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{doc.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Shared {new Date(doc.lastEdited).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant={doc.permissions === 'edit' ? 'default' : doc.permissions === 'comment' ? 'secondary' : 'outline'}>
                            {doc.permissions}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comments & Discussions</CardTitle>
                <CardDescription>
                  Engage in discussions about your thesis components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment or question..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addComment()}
                    />
                    <Button onClick={addComment} disabled={!newComment.trim()}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {messages.map((message) => (
                      <Card key={message.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{message.sender}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Badge>
                              </div>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            {message.type === 'comment' && (
                              <Badge variant="secondary">{message.documentId}</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication Center
                </CardTitle>
                <CardDescription>
                  Messages and discussions with your thesis team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <Card key={message.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-secondary rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{message.sender}</h3>
                              <Badge variant="outline" className="text-xs">
                                {message.type}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">{message.content}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(message.timestamp).toLocaleString()}
                              {message.documentId && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Document: {documents.find(d => d.id === message.documentId)?.title}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaborators" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Thesis Team
                </CardTitle>
                <CardDescription>
                  Manage your advisors, committee members, and collaborators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-6">
                  <Input placeholder="Search team members..." />
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>

                <div className="space-y-4">
                  {collaborators.map((member) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-secondary rounded-full h-12 w-12 flex items-center justify-center">
                              <Users className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{member.name}</h3>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{member.role}</Badge>
                                <span className={`inline-flex h-2 w-2 rounded-full ${
                                  member.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                                }`}></span>
                                <span className="text-xs text-muted-foreground">
                                  {member.status === 'active' ? 'Online' : `Last seen ${new Date(member.lastActive).toLocaleDateString()}`}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Reviews
                </CardTitle>
                <CardDescription>
                  Track feedback and review status of your thesis components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {documents.map((document) => (
                    <Card key={document.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                          <div>
                            <h3 className="font-semibold">{document.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Last edited by {document.lastEditor} on {new Date(document.lastEdited).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={
                                document.status === 'in-progress' ? 'default' :
                                document.status === 'review' ? 'secondary' :
                                document.status === 'approved' ? 'default' :
                                document.status === 'revision-needed' ? 'destructive' :
                                document.status === 'submitted' ? 'secondary' :
                                document.status === 'archived' ? 'outline' :
                                'outline'
                              } className={document.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}>
                                {document.status.replace('-', ' ')}
                              </Badge>
                              <Badge variant="outline">{document.permissions}</Badge>
                              <span className="text-sm text-muted-foreground">
                                • {document.commentsCount} comments
                                {document.hasUnreadComments && <span className="text-primary ml-1">(new)</span>}
                              </span>
                              {document.version && document.version > 1 && (
                                <Badge variant="outline" className="text-xs">v{document.version}</Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-sm font-medium">{document.progress}%</div>
                              <div className="text-xs text-muted-foreground">Complete</div>
                            </div>
                            <div className="w-32">
                              <Progress value={document.progress} />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Dynamic action buttons based on document state */}
                            {getDocumentActions(document, router, documentActionHandlers)
                              .slice(0, 4) // Show max 4 primary actions
                              .map((action) => {
                                const IconComponent = action.icon;
                                return (
                                  <Button
                                    key={action.id}
                                    variant={action.variant}
                                    size="sm"
                                    onClick={action.action}
                                    title={action.tooltip}
                                    className={action.id === 'pending' ? 'cursor-default' : ''}
                                  >
                                    <IconComponent className="h-4 w-4 mr-2" />
                                    {action.label}
                                  </Button>
                                );
                              })}
                            {/* More actions dropdown for additional actions */}
                            {getDocumentActions(document, router, documentActionHandlers).length > 4 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Show remaining actions - for now just show the next action
                                  const remainingActions = getDocumentActions(document, router, documentActionHandlers).slice(4);
                                  if (remainingActions.length > 0) {
                                    remainingActions[0].action();
                                  }
                                }}
                                title="More actions"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Stay updated on thesis reviews, comments, and approvals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`hover:shadow-md transition-shadow ${!notification.read ? 'bg-primary/10 border-primary/30' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {notification.type === 'comment' && <MessageCircle className="h-4 w-4 text-primary" />}
                              {notification.type === 'mention' && <AtSign className="h-4 w-4 text-green-500 dark:text-green-400" />}
                              {notification.type === 'approval' && <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />}
                              <h3 className={`font-semibold ${!notification.read ? 'font-bold' : ''}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center">
                                  <div className="h-2 w-2 rounded-full bg-primary-foreground"></div>
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{notification.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleNotificationRead(notification.id)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Document Viewer/Editor Dialog */}
        <Dialog open={!!viewingDocument} onOpenChange={(open) => !open && setViewingDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {viewingDocument?.title}
                <Badge variant={viewingDocument?.status === 'in-progress' ? 'default' : viewingDocument?.status === 'review' ? 'secondary' : 'outline'}>
                  {viewingDocument?.status?.replace('-', ' ')}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Last edited by {viewingDocument?.lastEditor} on{' '}
                {viewingDocument?.lastEdited && new Date(viewingDocument.lastEdited).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{viewingDocument?.permissions}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {viewingDocument?.commentsCount} comments
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{viewingDocument?.progress}% complete</span>
                  <div className="w-24">
                    <Progress value={viewingDocument?.progress || 0} />
                  </div>
                </div>
              </div>
              <Textarea
                className="flex-1 min-h-[400px] font-mono text-sm resize-none"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Document content..."
                readOnly={viewingDocument?.permissions === 'comment'}
              />
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {viewingDocument?.permissions === 'comment' ? (
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      View only - Comments allowed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Edit3 className="h-4 w-4" />
                      Edit mode enabled
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setViewingDocument(null)}>
                    Close
                  </Button>
                  {viewingDocument?.permissions === 'edit' && (
                    <Button
                      onClick={() => {
                        // In a real app, this would save to the backend
                        alert('Changes saved successfully!');
                        setViewingDocument(null);
                      }}
                    >
                      Save Changes
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}