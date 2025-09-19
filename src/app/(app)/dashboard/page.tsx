"use client";

import { useAuth } from "@/components/auth-provider";
import { AdvisorDashboard } from "@/components/advisor-dashboard";
import { AdminDashboard } from "@/components/admin-dashboard";
import { StudentDashboard } from "@/components/student-dashboard";
import { BrandedLoader } from "@/components/branded-loader";
import { CriticDashboard } from "@/components/critic-dashboard";

export default function DashboardPage() {
  const { profile } = useAuth();

  if (!profile) {
    return <BrandedLoader />;
  }

  switch (profile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'advisor':
      return <AdvisorDashboard />;
    case 'critic':
      return <CriticDashboard />;
    case 'user':
      return <StudentDashboard />;
    default:
      // Fallback for any unexpected role, preventing the student dashboard from showing incorrectly.
      return <BrandedLoader />;
  }
}