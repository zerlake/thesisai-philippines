"use client";

import { useAuth } from "@/components/auth-provider";
import { AdvisorDashboard } from "@/components/advisor-dashboard";
import { AdminDashboard } from "@/components/admin-dashboard";
import { StudentDashboard } from "@/components/student-dashboard";
import { MainLayoutSkeleton } from "@/components/main-layout-skeleton";

export default function DashboardPage() {
  const { profile } = useAuth();

  if (!profile) {
    return <MainLayoutSkeleton />;
  }

  if (profile.role === 'admin') {
    return <AdminDashboard />;
  }
  
  if (profile.role === 'advisor') {
    return <AdvisorDashboard />;
  }

  return <StudentDashboard />;
}