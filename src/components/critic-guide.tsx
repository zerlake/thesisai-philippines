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
        heading: "Opening a Document for Review",
        text: "From your dashboard's queue, click 'Review & Certify'. This opens the main document editor in a read-only mode. You cannot directly edit the student's text.",
      },
      {
        heading: "A Note on Editing: Feedback vs. Track Changes",
        text: "Unlike Microsoft Word's 'Track Changes' feature, you cannot directly edit the student's text. ThesisAI's review process is built on providing feedback through comments and the final review panel. This ensures the student remains the sole author and is responsible for implementing the suggested changes.",
      },
      {
        heading: "Using the Reviewer AI Toolkit",
        text: "On the right-hand panel, you'll find the AI Toolkit. Select any portion of text in the document to generate suggestions for improvement, paraphrasing, or to get structured feedback ideas.",
      },
      {
        heading: "Submitting Your Final Review",
        text: "Below the AI Toolkit is the Critic Review Panel. This is where you will write your overall comments, set your professional fee, and make your final decision to either 'Certify Document' or 'Request Revisions'.",
      },
    ],
  },
  {
    value: "billing",
    title: "4. Managing Billing and Payments (Offline Transactions)",
    icon: Banknote,
    content: [
      {
        heading: "How It Works: Your Digital Ledger",
        text: "Payments for your critic services are handled directly between you and the student. ThesisAI acts as your professional ledger to help you track these offline transactions (e.g., GCash, bank transfer).",
      },
      {
        heading: "Setting Your Fee",
        text: "When you certify a document or request revisions using the Critic Review Panel, you will set your professional fee. This action creates a billing record for both you and the student.",
      },
      {
        heading: "Receiving Payment Offline",
        text: "The student is responsible for paying you directly using your agreed-upon payment method. The platform simply facilitates the record-keeping.",
      },
      {
        heading: "Updating the Payment Status",
        text: "Once you receive payment, go to the 'Billing' page from your sidebar. Find the corresponding review and use the dropdown menu to change its status from 'Unpaid' to 'Paid'. This updates your earnings dashboard and the student's billing history to reflect that the payment has been recorded.",
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