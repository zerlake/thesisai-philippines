"use client";

import { useAuth } from "@/components/auth-provider";
import { AdvisorDashboard } from "@/components/advisor-dashboard";
import { StudentDashboardEnterprise } from "@/components/student-dashboard-enterprise";
import { BrandedLoader } from "@/components/branded-loader";
import { CriticDashboard } from "@/components/critic-dashboard";

export default function DashboardPage() {
  const { profile, isLoading } = useAuth();

  // Note: Auth-based redirects (login, role-based routing) are handled by AuthProvider

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
          <p className="text-sm text-muted-foreground/70 mt-1">This may take a few moments</p>
        </div>
      </div>
    );
  }

  // If no profile after loading complete, show minimal loading while redirect happens
  if (!profile) {
    return <BrandedLoader />;
  }

  // Add structured data based on user role
  const getStructuredData = () => {
    if (profile?.role === 'advisor') {
      return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Advisor Dashboard",
        "description": "Interface for thesis advisors to manage student progress and provide feedback."
      };
    } else if (profile?.role === 'critic') {
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

  switch (profile.role) {
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
              __html: JSON.stringify(getStructuredData())
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
              __html: JSON.stringify(getStructuredData())
            }}
          />
          <CriticDashboard />
        </>
      );
    case 'user':
      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(getStructuredData())
            }}
          />
          <StudentDashboardEnterprise />
        </>
      );
    default:
      return <BrandedLoader />;
  }
}