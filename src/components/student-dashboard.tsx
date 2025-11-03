"use client";

import {
  ArrowRight,
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
  Baseline,
  MessageSquare,
  Target,
  CheckSquare,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Link from "next/link";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { Skeleton } from "./ui/skeleton";
import { StatCard } from "./stat-card";
import { toast } from "sonner";
import { RecentActivityChart } from "./recent-activity-chart";
import { SessionGoalCard } from "./session-goal-card";
import { ThesisChecklist } from "./thesis-checklist";
import { MyMilestonesCard } from "./my-milestones-card";
import { WelcomeModal } from "./welcome-modal";
import { BugReportAlert } from "./bug-report-alert";
import { UserGuideCard } from "./user-guide-card";
import { TestimonialSubmissionCard } from "./testimonial-submission-card";
import { WhatsNextCard } from "./whats-next-card";
import { AdvisorFeedbackCard } from "./advisor-feedback-card";
import { thesisChecklist } from "../lib/checklist-items";
import { thesisMilestones } from "../lib/milestones";
import { ContextualActions } from "./contextual-actions";
import { WritingStreakCard } from "./writing-streak-card";
import { UpgradePromptCard } from "./upgrade-prompt-card";
import { WellbeingWidget } from "./student-dashboard-enhancements";
import { ProgressMilestones } from "./student-dashboard-enhancements";

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

export function StudentDashboard() {
  const { session, supabase, profile } = useAuth();
  const user = session?.user;
  const [displayName, setDisplayName] = useState("researcher");
  const [latestDocument, setLatestDocument] = useState<Document | null>(null);
  const [stats, setStats] = useState<Stats>({ docCount: 0, wordCount: 0, avgWordCount: 0, recentWordCount: 0 });
  const [nextAction, setNextAction] = useState<Action | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingNextAction, setIsLoadingNextAction] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const widgets = { ...defaultWidgets, ...profile?.user_preferences?.dashboard_widgets };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getNextAction = useCallback(async () => {
    if (!user) return;
    setIsLoadingNextAction(true);

    const { data: nextActionData, error } = await supabase.rpc('get_student_next_action', { p_student_id: user.id });

    if (error) {
      console.error("Error fetching next action:", error);
    } else if (nextActionData) {
        if (nextActionData.type === 'feedback') {
            setNextAction({ type: 'feedback', title: `Revise "${nextActionData.title || 'Untitled Document'}"`, detail: "Your advisor has requested revisions.", urgency: 'high', href: `/drafts/${nextActionData.id}`, icon: MessageSquare });
        } else if (nextActionData.type === 'milestone_overdue') {
            const milestoneInfo = thesisMilestones.find(m => m.key === nextActionData.key);
            const daysOverdue = differenceInDays(new Date(), new Date(nextActionData.deadline!));
            setNextAction({ type: 'milestone', title: `Overdue: ${milestoneInfo?.title || "Task"}`, detail: `This was due ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} ago.`, urgency: 'critical', href: '/dashboard', icon: Target });
        } else if (nextActionData.type === 'milestone_upcoming') {
            const milestoneInfo = thesisMilestones.find(m => m.key === nextActionData.key);
            const daysUntil = differenceInDays(new Date(nextActionData.deadline!), new Date());
            setNextAction({ type: 'milestone', title: `Upcoming: ${milestoneInfo?.title || "Task"}`, detail: `Due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}.`, urgency: 'high', href: '/dashboard', icon: Target });
        }
    } else {
        // Fallback to checklist if RPC returns null
        const { data: completedItems } = await supabase.from("checklist_progress").select("item_id").eq("user_id", user.id);
        const completedIds = new Set((completedItems || []).map(i => i.item_id));
        const allChecklistItems = thesisChecklist.flatMap(phase => phase.items);
        const nextTask = allChecklistItems.find(item => !completedIds.has(item.id));
        if (nextTask) {
            setNextAction({ type: 'task', title: nextTask.title, detail: nextTask.description, urgency: 'normal', href: nextTask.href || '/dashboard', icon: CheckSquare });
        } else {
            setNextAction({ type: 'task', title: "Prepare for Submission", detail: "You've completed all checklist items! Run a final originality check and prepare your presentation.", urgency: 'normal', href: '/originality-check', icon: BookCheck });
        }
    }
    setIsLoadingNextAction(false);
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

    const fetchLatestDocument = async () => {
      setIsLoadingDoc(true);
      const { data, error } = await supabase
        .from("documents")
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1);
      if (error) {
        console.error("Error fetching latest document:", error);
        toast.error("Failed to load latest document.");
      } else if (data && data.length > 0) {
        // Use the first (most recent) document
        setLatestDocument(data[0]);
      } else {
        // No documents found, set to null
        setLatestDocument(null);
      }
      setIsLoadingDoc(false);
    };

    const fetchStats = async () => {
      setIsLoadingStats(true);
      const { data: documents, error } = await supabase
        .from("documents")
        .select("content, updated_at")
        .eq("user_id", user.id);
      if (error) {
        console.error("Error fetching documents stats:", error);
        toast.error("Failed to load project stats.");
        setIsLoadingStats(false);
        return;
      }
      if (!documents) {
        // No documents found, set defaults
        setStats({ docCount: 0, wordCount: 0, avgWordCount: 0, recentWordCount: 0 });
        setIsLoadingStats(false);
        return;
      }
      if (documents) {
        const docCount = documents.length;
        const totalWordCount = documents.reduce((acc, doc) => acc + (doc.content || "").replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length, 0);
        const avgWordCount = docCount > 0 ? Math.round(totalWordCount / docCount) : 0;
        
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentWordCount = documents
          .filter(doc => new Date(doc.updated_at) > sevenDaysAgo)
          .reduce((acc, doc) => acc + (doc.content || "").replace(/<[^>]*>?/gm, '').split(/\s+/).filter(Boolean).length, 0);

        setStats({ docCount, wordCount: totalWordCount, avgWordCount, recentWordCount });
      }
      setIsLoadingStats(false);
    };

    fetchLatestDocument();
    fetchStats();
    getNextAction();
  }, [user, getNextAction, profile, supabase]);

  const handleModalClose = (open: boolean) => {
    if (!open) {
      localStorage.setItem("welcomeModalShown", "true");
      setShowWelcomeModal(false);
    }
  };

  return (
    <div className="space-y-8">
      <WelcomeModal open={showWelcomeModal} onOpenChange={handleModalClose} name={displayName} />
      
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="text-primary">{displayName}</span>!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your action plan and project overview.
        </p>
      </div>

      {/* Moved What's Next card to the top */}
      {widgets.next_action && (
        <div className="space-y-4">
          {profile?.plan === 'free' && <UpgradePromptCard />}
          <WhatsNextCard nextAction={nextAction} isLoading={isLoadingNextAction} />
          <AdvisorFeedbackCard />
          <ContextualActions nextAction={nextAction} latestDocument={latestDocument} />
        </div>
      )}

      {/* Thesis Checklist placed right after What's Next */}
      {widgets.checklist && (
        <div className="lg:col-span-2">
          <ThesisChecklist />
        </div>
      )}

      {widgets.stats && (isLoadingStats ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total Documents" value={stats.docCount} icon={FileText} />
          <StatCard title="Total Word Count" value={stats.wordCount.toLocaleString()} icon={BookOpenCheck} description={`+${stats.recentWordCount.toLocaleString()} in last 7 days`} />
          <StatCard title="Avg. Words / Doc" value={stats.avgWordCount.toLocaleString()} icon={Baseline} />
        </div>
      ))}

      <div className="grid gap-6 lg:grid-cols-3">
        {widgets.recent_activity && <RecentActivityChart />}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {widgets.session_goal && <SessionGoalCard />}
        {widgets.writing_streak && <WritingStreakCard />}
        {widgets.milestones && <MyMilestonesCard />}
      </div>

      {widgets.quick_access && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Quick Access Tools</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickAccessItems.map((item) => (
              <Link href={item.href} key={item.title}>
                <Card className="hover:bg-accent hover:text-accent-foreground transition-colors">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <item.icon className="w-8 h-8" />
                    <div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {widgets.progress_milestones && <ProgressMilestones />}
      {widgets.wellbeing && <WellbeingWidget />}

      <div className="grid gap-6 md:grid-cols-2">
        <UserGuideCard />
        <TestimonialSubmissionCard />
      </div>

      <BugReportAlert />
    </div>
  );
}