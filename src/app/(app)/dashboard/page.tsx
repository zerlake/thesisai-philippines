"use client";

import { useAuth } from "@/components/auth-provider";
import { AdvisorDashboard } from "@/components/advisor-dashboard";
import { AdminDashboard } from "@/components/admin-dashboard";
import { StudentDashboardEnterprise } from "@/components/student-dashboard-enterprise";
import { BrandedLoader } from "@/components/branded-loader";
import { CriticDashboard } from "@/components/critic-dashboard";

export default function DashboardPage() {
  const { profile, isLoading } = useAuth();

  // Only show loader if there's no session at all
  // If we have a session but profile is still loading, show skeleton/profile to avoid infinite loading
  if (!profile && !isLoading) {
    return <BrandedLoader />;
  }

  // If profile exists, proceed to render dashboard
  if (profile) {
    // Continue with dashboard rendering below...
  }
  // If we have no profile but loading is still ongoing, we might want to render a partial dashboard
  else if (isLoading) {
    // Render a skeleton dashboard or fallback UI to avoid infinite loading
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

  // Add structured data based on user role
  const getStructuredData = () => {
    if (profile.role === 'admin') {
      return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Admin Dashboard",
        "description": "Administrative interface for managing users, institutions, and testimonials."
      };
    } else if (profile.role === 'advisor') {
      return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Advisor Dashboard",
        "description": "Interface for thesis advisors to manage student progress and provide feedback."
      };
    } else if (profile.role === 'critic') {
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
      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(getStructuredData())
            }}
          />
          <AdminDashboard />
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