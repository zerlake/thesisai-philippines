"use client";

import { LayoutDashboard, MessageSquare, Target, Users } from "lucide-react";

const features = [
  {
    icon: <LayoutDashboard className="h-8 w-8" />,
    title: "Centralized Dashboard",
    description: "See all your students at a glance. Quickly identify who needs help with at-risk indicators for overdue milestones.",
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: "Efficient Feedback Loop",
    description: "Review submitted drafts directly on the platform. Leave comments and approve or request revisions with a single click.",
  },
  {
    icon: <Target className="h-8 w-8" />,
    title: "Milestone Management",
    description: "Set and track key deadlines for each student, from proposal defense to final submission, ensuring everyone stays on track.",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Holistic Progress View",
    description: "Get a clear view of each student's progress through their document history and their completed thesis checklist items.",
  },
];

export function ForAdvisorsSection() {
  return (
    <section className="py-16 md:py-24 lg:py-32">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">A Powerful Toolkit for Thesis Advisors</h2>
          <p className="mt-4 text-muted-foreground">
            Streamline your mentorship process, track student progress, and provide feedback more efficiently than ever before.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}