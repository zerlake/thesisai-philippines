"use client";

import { useAuth } from "@/components/auth-provider";
import { StatCard } from "@/components/stat-card";
import { FileText, PenSquare, ShieldCheck } from "lucide-react";
import { RecentActivityChart } from "@/components/recent-activity-chart";
import { ThesisChecklist } from "@/components/thesis-checklist";
import { SessionGoalCard } from "@/components/session-goal-card";
import { WritingStreakCard } from "@/components/writing-streak-card";
import { AdvisorFeedbackCard } from "@/components/advisor-feedback-card";
import { MyMilestonesCard } from "@/components/my-milestones-card";
import { UpgradePromptCard } from "@/components/upgrade-prompt-card";
import { UserGuideCard } from "@/components/user-guide-card";
import { WelcomeModal } from "@/components/welcome-modal";
import { useEffect, useState } from "react";
import { WhatsNextCard } from "@/components/whats-next-card";
import { AdvisorDashboard } from "@/components/advisor-dashboard";
import { AdminDashboard } from "@/components/admin-dashboard";

const WELCOME_MODAL_KEY = "thesisai-welcome-modal-shown";

export default function DashboardPage() {
  const { profile } = useAuth();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem(WELCOME_MODAL_KEY);
    if (!hasSeenModal) {
      setShowWelcomeModal(true);
      localStorage.setItem(WELCOME_MODAL_KEY, "true");
    }
  }, []);

  if (!profile) {
    return <div>Loading...</div>;
  }

  if (profile.role === 'admin') {
    return <AdminDashboard />;
  }
  
  if (profile.role === 'advisor') {
    return <AdvisorDashboard />;
  }

  return (
    <>
      <WelcomeModal 
        open={showWelcomeModal} 
        onOpenChange={setShowWelcomeModal}
        name={profile.first_name || "there"}
      />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {profile.first_name || "Researcher"}!
          </h1>
          <p className="text-muted-foreground">
            Here's a snapshot of your progress. Let's keep the momentum going.
          </p>
        </div>

        <div className="space-y-6">
          <AdvisorFeedbackCard />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Documents" value={profile.documents?.[0]?.count || 0} icon={FileText} />
          <StatCard title="Word Count" value={(profile.word_count || 0).toLocaleString()} icon={PenSquare} />
          <StatCard title="Plagiarism Checks" value={profile.plagiarism_checks || 0} icon={ShieldCheck} />
          <WritingStreakCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RecentActivityChart />
          </div>
          <div className="space-y-6">
            <SessionGoalCard />
            <MyMilestonesCard />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ThesisChecklist />
          <div className="space-y-6">
            {profile.plan === 'free' && <UpgradePromptCard />}
            <UserGuideCard />
          </div>
        </div>
      </div>
    </>
  );
}