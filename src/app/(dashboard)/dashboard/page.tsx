"use client";

import { useAuth } from "@/components/auth-provider";
import { AdvisorDashboard } from "@/components/advisor-dashboard";
import { StudentDashboardEnterprise } from "@/components/student-dashboard-enterprise";
import { CriticDashboard } from "@/components/critic-dashboard";

export default function DashboardPage() {
  const { profile, isLoading } = useAuth();

  // Add structured data based on user role
  const getStructuredData = (role: string) => {
    if (role === 'advisor') {
      return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Advisor Dashboard",
        "description": "Interface for thesis advisors to manage student progress and provide feedback."
      };
    } else if (role === 'critic') {
      return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Critic Dashboard",
        "description": "Manuscript critic interface for reviewing student work and providing certification."
      };
    } else {
      return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Student Dashboard",
        "description": "Personal workspace for students to manage their thesis projects with AI assistance."
      };
    }
  };

  // Determine role with fallback to 'user' to prevent blocking
  // This ensures the dashboard always renders immediately without waiting for profile to load
  const role = profile?.role || 'user';

  switch (role) {
    case 'admin':
      // Admin users can view the student dashboard (they have access to all dashboards)
      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": "Student Dashboard (Admin View)",
                "description": "Admin viewing the student dashboard interface."
              })
            }}
          />
          <StudentDashboardEnterprise />
        </>
      );
    case 'advisor':
      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(getStructuredData(role))
            }}
          />
          <AdvisorDashboard />
        </>
      );
    case 'critic':
      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(getStructuredData(role))
            }}
          />
          <CriticDashboard />
        </>
      );
    case 'user':
    default:
      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(getStructuredData(role))
            }}
          />
          <StudentDashboardEnterprise />
        </>
      );
  }
}