"use client";

import { useAuth } from "@/components/auth-provider";
import { AdvisorDashboard } from "@/components/advisor-dashboard";
import { AdminDashboard } from "@/components/admin-dashboard";
import { StudentDashboardEnterprise } from "@/components/student-dashboard-enterprise";
import { BrandedLoader } from "@/components/branded-loader";
import { CriticDashboard } from "@/components/critic-dashboard";

export default function DashboardPage() {
  const { profile, isLoading } = useAuth();

  console.log("[Dashboard] Profile loaded:", profile?.role, "isLoading:", isLoading);

  // AGGRESSIVE FIX: Never wait for loading state
  // If user is navigating to /dashboard, assume they're authenticated
  // Render the appropriate dashboard immediately, let it handle loading states
  
  // Only show BrandedLoader if explicitly not authenticated (no profile and done loading)
  if (!profile && !isLoading) {
    return <BrandedLoader />;
  }

  // If profile exists, render the dashboard - don't wait for isLoading
  // The dashboard component handles its own loading states with skeletons
  if (profile) {
    // Add structured data based on user role
    const getStructuredData = () => {
      if (profile?.role === 'admin') {
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Admin Dashboard",
          "description": "Administrative interface for managing users, institutions, and testimonials."
        };
      } else if (profile?.role === 'advisor') {
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

  // Only reached if profile is null AND isLoading is true
  // Show a very brief loader, but ensure it times out
  // This is a safety net, should rarely be seen
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-lg text-muted-foreground">Initializing...</p>
      </div>
    </div>
  );
}
