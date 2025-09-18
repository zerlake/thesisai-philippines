"use client";

import { useAuth } from "@/components/auth-provider";
import { AdvisorDashboard } from "@/components/advisor-dashboard";
import { AdminDashboard } from "@/components/admin-dashboard";
import { StudentDashboard } from "@/components/student-dashboard";
import { BrandedLoader } from "@/components/branded-loader";

export default function DashboardPage() {
  const { profile } = useAuth();

  if (!profile) {
    return <BrandedLoader />;
  }

  if (profile.role === 'admin') {
    return <AdminDashboard />;
  }
  
  if (profile.role === 'advisor') {
    return <AdvisorDashboard />;
  }

  return <StudentDashboard />;
}