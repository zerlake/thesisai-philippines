"use client";

import { AdvisorEmailNotifications } from "@/components/advisor-email-notifications";

export default function TestAdvisorNotificationsPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Test: Advisor Email Notifications</h1>
      <p className="mb-4 text-gray-600">
        This page tests the new AdvisorEmailNotifications component.
      </p>
      <AdvisorEmailNotifications />
    </div>
  );
}
