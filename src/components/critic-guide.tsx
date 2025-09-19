"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  BookUser,
  CheckCircle,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Banknote,
} from "lucide-react";

const guideSections = [
  {
    value: "getting-started",
    title: "1. Understanding Your Role as a Manuscript Critic",
    icon: ShieldCheck,
    content: [
      {
        heading: "Your Primary Responsibility",
        text: "As a Manuscript Critic, your main role is to perform the final quality check on a student's manuscript after it has been approved by their primary thesis advisor. Your focus is on language, grammar, style, formatting, and overall clarity.",
      },
      {
        heading: "Certification vs. Revision",
        text: "You have two main actions: 'Certify Document', which endorses the paper as ready for final submission, or 'Request Revisions', which sends it back to the student with your feedback for necessary corrections.",
      },
    ],
  },
  {
    value: "dashboard",
    title: "2. Navigating Your Dashboard",
    icon: LayoutDashboard,
    content: [
      {
        heading: "The Review & Certification Queue",
        text: "This is the most important part of your dashboard. It lists all manuscripts that have been approved by their advisors and are now awaiting your final review. They are ordered by submission date, so you can tackle the oldest ones first.",
      },
      {
        heading: "Assigned Students List",
        text: "The 'Assigned Students' page gives you an overview of all students who have designated you as their critic, along with the status of their latest documents.",
      },
    ],
  },
  {
    value: "review-process",
    title: "3. The Review and Certification Process",
    icon: Sparkles,
    content: [
      {
        heading: "Opening a Document",
        text: "From the queue, click 'Review & Certify' to open a student's document. You will be in a read-only mode, but you can select text to use the AI Toolkit.",
      },
      {
        heading: "Using the Reviewer AI Toolkit",
        text: "Select any portion of text to generate suggestions for improvement, paraphrasing, or summarization. You can also generate structured feedback (positive points and areas for improvement) to help formulate your comments.",
      },
      {
        heading: "Using the Critic Review Panel",
        text: "On the right side of the editor, you'll find the Critic Review Panel. Here you can write your overall comments, set your review fee, and make your final decision to either certify the document or request revisions.",
      },
    ],
  },
  {
    value: "billing",
    title: "4. Managing Billing and Payments",
    icon: Banknote,
    content: [
      {
        heading: "Setting Your Fee",
        text: "When you submit a review, you can set a fee for your services. This fee is recorded in the system for your and the student's reference.",
      },
      {
        heading: "Tracking Payments",
        text: "Navigate to the 'Billing' page from your sidebar to see a complete history of all your reviews. You can track total earnings and manually update the payment status of each review from 'Unpaid' to 'Paid' once you receive payment from the student.",
      },
    ],
  },
];

export function CriticGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Manuscript Critic Guide</CardTitle>
          <CardDescription>
            Your complete guide to using ThesisAI for reviewing and certifying student manuscripts.
          </CardDescription>
        </CardHeader>
      </Card>

      <Accordion type="multiple" defaultValue={["getting-started"]} className="w-full space-y-4">
        {guideSections.map((section) => (
          <AccordionItem value={section.value} key={section.value} className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-3">
                <section.icon className="w-6 h-6 text-primary" />
                {section.title}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="space-y-4">
                {section.content.map((item) => (
                  <div key={item.heading}>
                    <h4 className="font-semibold">{item.heading}</h4>
                    <p className="text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}