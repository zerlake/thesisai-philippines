"use client";

import { useAuth } from "@/components/auth-provider";
import { BrandedLoader } from "@/components/branded-loader";
import { DataManagementAdvisorView } from "@/components/data-management-advisor-view";
import { StudentDmpForm } from "@/components/student-dmp-form";

export default function DataManagementPage() {
  const { profile } = useAuth();

  if (!profile) {
    return <BrandedLoader />;
  }

  if (profile.role === 'advisor') {
    return <DataManagementAdvisorView />;
  }

  return <StudentDmpForm />;
}