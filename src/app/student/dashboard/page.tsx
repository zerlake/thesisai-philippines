import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SessionGoalCard } from "@/components/session-goal-card";
import { BugReportAlert } from "@/components/bug-report-alert";

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Dashboard</CardTitle>
          <CardDescription>
            Welcome! Here you can submit your manuscripts and view feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content for the student dashboard will be built here.</p>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <SessionGoalCard />
      </div>
      <BugReportAlert />
    </div>
  );
}