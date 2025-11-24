"use client";

import { useAuth } from "@/components/auth-provider";
import { AdvisorDashboard } from "@/components/advisor-dashboard";
import { AdminDashboard } from "@/components/admin-dashboard";
import { StudentDashboardEnterprise } from "@/components/student-dashboard-enterprise";
import { BrandedLoader } from "@/components/branded-loader";
import { CriticDashboard } from "@/components/critic-dashboard";

export default function DashboardPage() {
  const { profile } = useAuth();

  if (!profile) {
    return <BrandedLoader />;
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