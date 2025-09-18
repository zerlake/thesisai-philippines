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
  BookOpen,
  BrainCircuit,
  FileText,
  FlaskConical,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";

const guideSections = [
  {
    value: "getting-started",
    title: "Getting Started",
    icon: Sparkles,
    content: [
      {
        heading: "The Dashboard",
        text: "Your dashboard is the central hub of your workspace. It provides a statistical overview of your project, quick access to your most recent document, and links to all the powerful tools ThesisAI has to offer.",
      },
      {
        heading: "The Sidebar",
        text: "The sidebar is your primary navigation. All tools are grouped into logical categories like 'Pre-Writing', 'Writing Helpers', and 'Review Tools' so you can easily find what you need at any stage of your academic journey.",
      },
    ],
  },
  {
    value: "workspace",
    title: "Workspace Tools",
    icon: LayoutDashboard,
    content: [
      {
        heading: "Drafts",
        text: "This is where all your documents live. You can create new documents from scratch, use helpful templates like a Title Page or Chapter I structure, search your existing drafts, and open the editor to continue your work.",
      },
      {
        heading: "The Editor",
        text: "Our rich-text editor is where the magic happens. You can format your text, but more importantly, you can highlight any sentence or paragraph to access contextual AI tools like 'Improve', 'Summarize', and 'Rewrite' directly from the bubble menu.",
      },
      {
        heading: "Resources",
        text: "The Resource Hub contains an interactive citation formatter to help you learn citation styles, quick writing guides, links to official university style manuals, and tips for productivity and wellbeing.",
      },
    ],
  },
  {
    value: "ai-tools",
    title: "AI Writing & Research Tools",
    icon: BrainCircuit,
    content: [
      {
        heading: "Topic Idea & Outline Generators",
        text: "Stuck at the beginning? Use the Topic Idea Generator to brainstorm researchable topics in your field. Once you have a topic, the Outline Generator will create a standard 5-chapter structure tailored to your subject.",
      },
      {
        heading: "Research Helper",
        text: "Search Google Scholar and the web for academic sources. You can select multiple sources and use the 'Synthesize' feature to have the AI write a cohesive paragraph combining the key ideas from your selected papers.",
      },
      {
        heading: "Methodology, Results, & Conclusion Helpers",
        text: "These dedicated pages provide interactive tools and AI generators to help you write the most challenging chapters of your academic paper. From choosing a statistical test to generating a draft of your conclusion, these helpers guide you through the process.",
      },
      {
        heading: "Originality Checker",
        text: "Paste your text to check for potential plagiarism against billions of web pages. The checker highlights potential matches and even allows you to generate a citation for the source on the spot.",
      },
    ],
  },
  {
    value: "for-advisors",
    title: "For Advisors",
    icon: UserCheck,
    content: [
      {
        heading: "Advisor Dashboard",
        text: "Your dashboard provides an overview of all your assigned students. You can see key stats, manage student requests, and quickly identify at-risk students who have overdue milestones.",
      },
      {
        heading: "Viewing Student Details",
        text: "Click on any student to see their detailed progress, including their document list, their completed checklist items, and their milestone deadlines. You can open any of their documents to review them.",
      },
      {
        heading: "Reviewing Documents",
        text: "When a student submits a document for review, you can open it, provide comments, and use the Advisor Review Panel to either 'Approve' the document or 'Request Revisions' with your feedback.",
      },
    ],
  },
];

export function UserGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">ThesisAI User Guide</CardTitle>
          <CardDescription>
            Your complete guide to mastering all the features for your thesis, dissertation, or academic paper.
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