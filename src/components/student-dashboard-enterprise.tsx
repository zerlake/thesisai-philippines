"use client";

import {
  BookCheck,
  BrainCircuit,
  ClipboardCheck,
  ClipboardPen,
  FileText,
  FlaskConical,
  Lightbulb,
  List,
  Presentation,
  ShieldCheck,
  BookOpenCheck,
  BookOpen,
  MessageSquare,
  Target,
  CheckSquare,
  Square,
  Users,
  Folder,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "./auth-provider";
import { useEffect, useState, useCallback } from "react";
import { differenceInDays } from "date-fns";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { getMockDataEnabled, setGlobalMockDataEnabled } from "@/lib/mock-referral-data";
import { RecentActivityChart } from "./recent-activity-chart";
import { SmartSessionGoalCard } from "./SmartSessionGoalCard";
import { ThesisChecklist } from "./thesis-checklist";
import { MyMilestonesCard } from "./my-milestones-card";
import { WelcomeModal } from "./welcome-modal";
import { BugReportAlert } from "./bug-report-alert";
import { UserGuideCard } from "./user-guide-card";
import { TestimonialSubmissionCard } from "./testimonial-submission-card";
import { WhatsNextCard } from "./whats-next-card";
import { AdvisorFeedbackCard } from "./advisor-feedback-card";
import { DashboardNotificationSettings } from "./dashboard-notification-settings";
import { thesisChecklist } from "../lib/checklist-items";
import { thesisMilestones } from "../lib/milestones";
import { ContextualActions } from "./contextual-actions";
import { WritingStreakCard } from "./writing-streak-card";
import { UpgradePromptCard } from "./upgrade-prompt-card";
import { WellbeingWidget } from "./student-dashboard-enhancements";
import { ProgressMilestones } from "./student-dashboard-enhancements";
import { DashboardHeader } from "./dashboard-header";
import { DashboardMetrics } from "./dashboard-metrics";
import { DashboardNavigation } from "./dashboard-navigation";
import { EnterpriseCard, EnterpriseCardContent } from "./enterprise-card";
import { ThesisPhasesCard } from "./thesis-phases-card";
import { DashboardRealtimeProvider } from "./dashboard/DashboardRealtimeProvider";
import { EnterpriseAppsCard } from "./enterprise-apps-card";
import { EnterpriseWorkflowsCard } from "./enterprise-workflows-card";
import { ChatInterface } from "./chat-interface";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const quickAccessItems = [
  {
    icon: BrainCircuit,
    title: "Topic Idea Generator",
    description: "Brainstorm your topic.",
    href: "/topic-ideas",
  },
  {
    icon: List,
    title: "Outline Generator",
    description: "Structure your thesis.",
    href: "/outline",
  },
  {
    icon: FlaskConical,
    title: "Research Helper",
    description: "Find academic papers.",
    href: "/research",
  },
  {
    icon: ClipboardPen,
    title: "Methodology Helper",
    description: "Design your research.",
    href: "/methodology",
  },
  {
    icon: ClipboardCheck,
    title: "Results Helper",
    description: "Present your findings.",
    href: "/results",
  },
  {
    icon: BookCheck,
    title: "Conclusion Helper",
    description: "Summarize your work.",
    href: "/conclusion",
  },
  {
    icon: Presentation,
    title: "Presentation Maker",
    description: "Create your slide deck.",
    href: "/presentation",
  },
  {
    icon: Lightbulb,
    title: "Flashcards",
    description: "Study key concepts.",
    href: "/flashcards",
  },
  {
    icon: ShieldCheck,
    title: "Originality Check",
    description: "Scan for plagiarism.",
    href: "/originality-check",
  },
  {
    icon: FileText,
    title: "Reference Manager",
    description: "Manage your citations.",
    href: "/references",
  },
  {
    icon: FileText,
    title: "PDF & Document Analysis",
    description: "Analyze your documents.",
    href: "/document-analyzer",
  },
  {
    icon: BookOpen,
    title: "Research Article Analyzer",
    description: "Analyze research articles with structured extraction.",
    href: "/research-article-analyzer",
  },
  {
    icon: Folder,
    title: "Research Groups",
    description: "Organize and manage research projects.",
    href: "/research-groups",
  },
  {
    icon: Users,
    title: "Literature Review Collaboration",
    description: "Collaborate with your team.",
    href: "/literature-review",
  },
  {
    icon: Target,
    title: "Variable Mapping Tool",
    description: "Map research variables.",
    href: "/variable-mapping-tool",
  },
  {
    icon: Square,
    title: "University Format Checker",
    description: "Check format compliance.",
    href: "/university-format-checker",
  },
  {
    icon: Lightbulb,
    title: "Research Problem Identifier",
    description: "Find research problems.",
    href: "/research-problem-identifier",
  },
  {
    icon: Presentation,
    title: "Defense PPT Coach",
    description: "Create structured defense presentations.",
    href: "/defense-ppt-coach",
  },
];

type Document = {
  id: string;
  title: string | null;
  updated_at: string;
};

type Stats = {
  docCount: number;
  wordCount: number;
  avgWordCount: number;
  recentWordCount: number;
};

type Action = {
  type: 'feedback' | 'milestone' | 'task';
  title: string;
  detail: string;
  urgency: 'critical' | 'high' | 'normal';
  href: string;
  icon: LucideIcon;
};

const defaultWidgets = {
  stats: true,
  next_action: true,
  recent_activity: true,
  checklist: true,
  session_goal: true,
  writing_streak: true,
  milestones: true,
  quick_access: true,
  wellbeing: true,
  progress_milestones: true,
};

export function StudentDashboardEnterprise() {
  const { session, supabase, profile } = useAuth();
  const user = session?.user;
  const [displayName, setDisplayName] = useState("researcher");
  const [latestDocument, setLatestDocument] = useState<Document | null>(null);
  const [stats, setStats] = useState<Stats>({ docCount: 0, wordCount: 0, avgWordCount: 0, recentWordCount: 0 });
  const [nextAction, setNextAction] = useState<Action | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingNextAction, setIsLoadingNextAction] = useState(true);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const widgets = { ...defaultWidgets, ...profile?.user_preferences?.dashboard_widgets };

  const getNextAction = useCallback(async () => {
    if (!user) return;
    setIsLoadingNextAction(true);

    try {
      // First try to call the RPC function if it exists
      let nextActionData = null;
      let rpcError = null;

      try {
        const { data, error } = await supabase.rpc('get_student_next_action', { p_student_id: user.id });
        nextActionData = data;
        rpcError = error;
      } catch (rpcCallError) {
        // RPC function doesn't exist or has an issue
        rpcError = rpcCallError;
      }

      if (rpcError) {
        // If the RPC function doesn't exist, use fallback logic
        console.warn("Next action RPC unavailable, using fallback logic:", rpcError);

        // Use checklist-based logic
        const { data: completedItems, error: checklistError } = await supabase
          .from("checklist_progress")
          .select("item_id")
          .eq("user_id", user.id)
          .throwOnError(); // This will throw if there's an error

        if (checklistError) {
          throw checklistError;
        }

        const completedIds = new Set((completedItems || []).map(i => i.item_id));
        const allChecklistItems = thesisChecklist.flatMap(phase => phase.items);
        const nextTask = allChecklistItems.find(item => !completedIds.has(item.id));

        if (nextTask) {
          setNextAction({
            type: 'task',
            title: nextTask.title,
            detail: nextTask.description,
            urgency: 'normal',
            href: nextTask.href || '/dashboard',
            icon: CheckSquare
          });
        } else {
          setNextAction({
            type: 'task',
            title: "Prepare for Submission",
            detail: "You've completed all checklist items! Run a final originality check and prepare your presentation.",
            urgency: 'normal',
            href: '/originality-check',
            icon: BookCheck
          });
        }
      } else if (nextActionData) {
        if (nextActionData.type === 'feedback') {
          setNextAction({
            type: 'feedback',
            title: `Revise "${nextActionData.title || 'Untitled Document'}"`,
            detail: "Your advisor has requested revisions.",
            urgency: 'high',
            href: `/drafts/${nextActionData.id}`,
            icon: MessageSquare
          });
        } else if (nextActionData.type === 'milestone_overdue') {
          const milestoneInfo = thesisMilestones.find(m => m.key === nextActionData.key);
          const daysOverdue = differenceInDays(new Date(), new Date(nextActionData.deadline!));
          setNextAction({
            type: 'milestone',
            title: `Overdue: ${milestoneInfo?.title || "Task"}`,
            detail: `This was due ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} ago.`,
            urgency: 'critical',
            href: '/dashboard',
            icon: Target
          });
        } else if (nextActionData.type === 'milestone_upcoming') {
          const milestoneInfo = thesisMilestones.find(m => m.key === nextActionData.key);
          const daysUntil = differenceInDays(new Date(nextActionData.deadline!), new Date());
          setNextAction({
            type: 'milestone',
            title: `Upcoming: ${milestoneInfo?.title || "Task"}`,
            detail: `Due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}.`,
            urgency: 'high',
            href: '/dashboard',
            icon: Target
          });
        }
      } else {
        // No specific next action, fall back to checklist logic
        const { data: completedItems } = await supabase
          .from("checklist_progress")
          .select("item_id")
          .eq("user_id", user.id);

        const completedIds = new Set((completedItems || []).map(i => i.item_id));
        const allChecklistItems = thesisChecklist.flatMap(phase => phase.items);
        const nextTask = allChecklistItems.find(item => !completedIds.has(item.id));

        if (nextTask) {
          setNextAction({
            type: 'task',
            title: nextTask.title,
            detail: nextTask.description,
            urgency: 'normal',
            href: nextTask.href || '/dashboard',
            icon: CheckSquare
          });
        } else {
          setNextAction({
            type: 'task',
            title: "Prepare for Submission",
            detail: "You've completed all checklist items! Run a final originality check and prepare your presentation.",
            urgency: 'normal',
            href: '/originality-check',
            icon: BookCheck
          });
        }
      }
    } catch (err) {
      console.error("Error fetching next action (fallback in use):", err);
      // Set a default next action if something unexpected happens
      setNextAction({
        type: 'task',
        title: "Continue Your Research",
        detail: "Check out the new Apps and Workflows to accelerate your thesis work.",
        urgency: 'normal',
        href: '/apps',
        icon: Target
      });
    } finally {
      setIsLoadingNextAction(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!user) return;

    const welcomeModalShown = localStorage.getItem("welcomeModalShown");
    if (!welcomeModalShown) {
      setShowWelcomeModal(true);
    }

    let name = "researcher";
    if (profile && profile.first_name) name = profile.first_name;
    else if (user.email) name = user.email.split('@')[0];
    setDisplayName(name);

    // Use a timeout to avoid hanging
    const timeoutId = setTimeout(() => {
      setIsLoadingDoc(false);
      setIsLoadingStats(false);
    }, 10000); // 10 second timeout

    const fetchLatestDocument = async () => {
      setIsLoadingDoc(true);
      try {
        const { data, error } = await supabase.from("documents").select("id, title, updated_at").order("updated_at", { ascending: false, nullsFirst: false }).limit(1);
        if (error) {
          console.error("Error fetching latest document:", error);
        } else if (data && data.length > 0) {
          setLatestDocument(data[0]);
        }
      } catch (err) {
        console.error("Error in fetchLatestDocument:", err);
      } finally {
        setIsLoadingDoc(false);
      }
    };

    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const { data: documents, error } = await supabase.from("documents").select("content, updated_at");
        if (error) {
          console.error("Error fetching stats:", error);
          toast.error("Failed to load project stats.");
        } else if (documents) {
          const docCount = documents.length;
          const totalWordCount = documents.reduce((acc, doc) => acc + (doc.content || "").replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length, 0);
          const avgWordCount = docCount > 0 ? Math.round(totalWordCount / docCount) : 0;

          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const recentDocuments = documents.filter(doc => doc.updated_at && new Date(doc.updated_at) > sevenDaysAgo);
          const recentWordCount = recentDocuments.reduce((acc, doc) => acc + (doc.content || "").replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length, 0);

          setStats({ docCount, wordCount: totalWordCount, avgWordCount, recentWordCount });
        }
      } catch (err) {
        console.error("Error in fetchStats:", err);
        toast.error("Failed to load project stats.");
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchLatestDocument();
    fetchStats();

    // Clear timeout when component unmounts or effect runs again
    return () => {
      clearTimeout(timeoutId);
    };
  }, [user, profile, supabase]);

  // Separate effect to call getNextAction after initial data is loaded
  useEffect(() => {
    if (user) {
      // Call after a small delay to ensure other data loads first
      const nextActionTimer = setTimeout(() => {
        getNextAction();
      }, 500);

      return () => clearTimeout(nextActionTimer);
    }
  }, [user, getNextAction]);

  const handleModalClose = (open: boolean) => {
    if (!open) {
      localStorage.setItem("welcomeModalShown", "true");
      setShowWelcomeModal(false);
    }
  };

  const [useMockData, setUseMockData] = useState(getMockDataEnabled());

  // Handle mock data toggle
  const handleToggleMockData = () => {
    const newValue = !useMockData;
    setUseMockData(newValue);
    setGlobalMockDataEnabled(newValue);

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('mock-data-toggle'));

    // Show toast notification
    if (newValue) {
      toast('Mock Data Enabled', {
        description: 'Using sample data for development and testing'
      });
    } else {
      toast('Mock Data Disabled', {
        description: 'Using real data from production database'
      });
    }
  };

  return (
    <DashboardRealtimeProvider
      autoConnect={true}
      onInitialized={() => console.log('Real-time system initialized')}
      onError={(error) => console.error('Real-time error:', error)}
    >
      <div className="min-h-screen space-y-8 bg-background">
        <WelcomeModal open={showWelcomeModal} onOpenChange={handleModalClose} name={displayName} />

        {/* Dashboard Header with Email Notifications and Mock Data Toggle */}
        <div className="flex items-start justify-between border-b bg-gradient-to-b from-background to-background/50 pb-8 space-y-6 px-1">
          <div className="flex-1">
            <DashboardHeader
              displayName={displayName}
              streak={5}
              projectProgress={65}
            />
          </div>
          <div className="flex gap-2 pt-8">
            <DashboardNotificationSettings userRole="student" />
            {/* Mock Data Toggle Button */}
            <button
              onClick={handleToggleMockData}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${useMockData ? 'bg-amber-100 border-amber-500 text-amber-800 hover:bg-amber-200' : 'bg-green-100 border-green-500 text-green-800 hover:bg-green-200'}`}
              title={useMockData ? 'Disable mock data' : 'Enable mock data'}
            >
              <svg className={`w-5 h-5 ${useMockData ? 'text-amber-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                {useMockData ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span className="text-sm font-semibold">
                {useMockData ? 'Mock Data' : 'Live Data'}
              </span>
            </button>
          </div>
        </div>

      <div className="space-y-8 px-1">
        {/* Upgrade Banner */}
        {profile?.plan === 'free' && widgets.next_action && (
          <UpgradePromptCard />
        )}

        {/* Next Actions Section */}
        {widgets.next_action && (
          <div className="space-y-4">
            <WhatsNextCard nextAction={nextAction} isLoading={isLoadingNextAction} />
            <AdvisorFeedbackCard />
            <ContextualActions nextAction={nextAction} latestDocument={latestDocument} />
          </div>
        )}

        {/* Metrics Section */}
        {widgets.stats && (
          <DashboardMetrics
            docCount={stats.docCount}
            wordCount={stats.wordCount}
            avgWordCount={stats.avgWordCount}
            recentWordCount={stats.recentWordCount}
            isLoading={isLoadingStats}
          />
        )}

        {/* Checklist Section */}
        {widgets.checklist && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Thesis Completion Checklist</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Track your progress through each phase of your thesis
              </p>
            </div>
            <ThesisChecklist />
          </div>
        )}

        {/* Thesis Phases Workstations */}
        <ThesisPhasesCard />

        {/* Apps & Workflows */}
        <div className="grid gap-6 lg:grid-cols-2">
          <EnterpriseAppsCard />
          <EnterpriseWorkflowsCard />
        </div>

        {/* Quick Tools Navigation */}
        {widgets.quick_access && (
          <DashboardNavigation
            items={quickAccessItems}
            title="Essential Research Tools"
          />
        )}

        {/* Activity & Progress Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {widgets.recent_activity && <RecentActivityChart />}
        </div>

        {/* Goal & Streak Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {widgets.session_goal && <SmartSessionGoalCard />}
          {widgets.writing_streak && <WritingStreakCard />}
          {widgets.milestones && <MyMilestonesCard />}
        </div>

        {/* Progress & Wellbeing */}
        {(widgets.progress_milestones || widgets.wellbeing) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {widgets.progress_milestones && <ProgressMilestones />}
            {widgets.wellbeing && <WellbeingWidget />}
          </div>
        )}

        {/* Chat Interface in a right sidebar position */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Messages & Conversations</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Chat with your advisor, critic, and other collaborators
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <ChatInterface />
            </div>
          </CardContent>
        </Card>

        {/* Learning Resources */}
        <div className="grid gap-6 md:grid-cols-2">
          <UserGuideCard />
          <TestimonialSubmissionCard />
        </div>

        {/* Support Section */}
        <BugReportAlert />
      </div>
    </div>
    </DashboardRealtimeProvider>
  );
}
