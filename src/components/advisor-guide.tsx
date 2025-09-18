"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Clock,
  Edit3,
  FlaskConical,
  Heart,
  Mic,
  ShieldCheck,
  Sparkles,
  Users,
  CheckSquare,
  ShieldAlert,
  Briefcase,
  FolderLock,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const guideSections = [
  {
    value: "section-1",
    title: "1. Establishing a Strong Advisor-Student Relationship",
    icon: Users,
    content: [
      {
        heading: "Build trust and open communication",
        text: "Create an environment where students feel comfortable sharing challenges and asking questions. Regular check-ins and active listening are vital.",
      },
      {
        heading: "Set clear expectations",
        text: "Discuss timelines, milestones, communication preferences, and academic standards early to prevent misunderstandings.",
      },
      {
        heading: "Respect cultural and individual diversity",
        text: "Recognize students’ backgrounds, learning styles, and personal circumstances, adapting your mentorship approach accordingly.",
      },
    ],
  },
  {
    value: "section-2",
    title: "2. Guiding Research Planning and Methodology",
    icon: FlaskConical,
    content: [
      {
        heading: "Assist in topic refinement",
        text: "Help students narrow down broad ideas into clear, feasible research questions.",
      },
      {
        heading: "Advise on appropriate methodologies",
        text: "Provide guidance on qualitative, quantitative, or mixed methods research tailored to their discipline and objectives.",
      },
      {
        heading: "Encourage ethical research practices",
        text: "Emphasize adherence to institutional review boards, data privacy, and academic integrity.",
      },
    ],
  },
  {
    value: "section-data-management",
    title: "3. Data Management and Research Security",
    icon: FolderLock,
    content: [
      {
        heading: "Implementing Robust Data Governance",
        text: "Guide students in creating a Data Management Plan (DMP) from the start. This should outline how data will be collected, stored, organized, and shared, ensuring clarity and consistency throughout the project.",
      },
      {
        heading: "Ensuring Compliance and Security",
        text: "Reinforce the importance of complying with institutional requirements (IRB) and data privacy regulations. Advise on best practices for cybersecurity, such as using secure storage, encrypting sensitive data, and anonymizing participant information.",
      },
      {
        heading: "Planning for Long-Term Data Archiving",
        text: "Discuss the importance of long-term data preservation. Guide students on how to archive their datasets in a repository, making their research verifiable and accessible for future scholars, which also increases the impact of their work.",
      },
    ],
  },
  {
    value: "section-3",
    title: "4. Supporting Effective Writing and Technical Skills",
    icon: Edit3,
    content: [
      {
        heading: "Provide constructive feedback",
        text: "Focus on clarity, coherence, and argument strength while also addressing grammar and formatting issues.",
      },
      {
        heading: "Facilitate workshops or peer review groups",
        text: "Encourage collaboration and review among student cohorts to improve writing skills collectively.",
      },
      {
        heading: "Identifying Common Writing Challenges",
        text: "Look for common issues like code-switching ('Taglish') in formal writing, difficulties in synthesizing sources, and structuring arguments. Guide them to use the platform's AI tools for paraphrasing and improving academic tone while ensuring they maintain their own voice.",
      },
    ],
  },
  {
    value: "section-9",
    title: "5. Advanced Communication and Conflict Resolution",
    icon: ShieldAlert,
    content: [
      {
        heading: "Navigating Difficult Conversations",
        text: "When addressing issues like missed deadlines or subpar work, use the 'sandwich' method: start with a positive, state the concern clearly and objectively, and end with a supportive, forward-looking statement. Focus on the work, not the person.",
      },
      {
        heading: "Managing Underperforming Students with Compassion",
        text: "Approach underperformance with curiosity, not judgment. Ask open-ended questions to understand the root cause (e.g., 'I've noticed progress has slowed. How are things going?'). Co-create a clear, simple plan with small, achievable steps to help them get back on track.",
      },
      {
        heading: "Mediating Disputes",
        text: "If conflicts arise between the student and committee members, act as a neutral facilitator. Arrange a meeting where all parties can voice their perspectives. Your role is to find common ground and ensure the feedback is constructive and actionable for the student.",
      },
    ],
  },
  {
    value: "section-4",
    title: "6. Managing Milestones and Deadlines",
    icon: Clock,
    content: [
      {
        heading: "Create a detailed timeline",
        text: "Break the thesis process into manageable phases with target deadlines.",
      },
      {
        heading: "Use the built-in Milestone Tracker",
        text: "Leverage the Milestone Tracker on each student's detail page to set deadlines and monitor their progress through key thesis stages.",
      },
      {
        heading: "Identify and address delays early",
        text: "Intervene promptly when students face obstacles, offering solutions or referrals as needed.",
      },
    ],
  },
  {
    value: "section-5",
    title: "7. Nurturing Student Wellbeing and Motivation",
    icon: Heart,
    content: [
      {
        heading: "Recognize signs of stress and burnout",
        text: "Encourage open discussions about mental health and academic pressures.",
      },
      {
        heading: "Promote work-life balance",
        text: "Advise students on realistic workload management and self-care techniques.",
      },
      {
        heading: "Connect to support services",
        text: "Guide students toward counseling, tutoring, or peer support programs within the institution.",
      },
    ],
  },
  {
    value: "section-6",
    title: "8. Preparing Students for Defense and Publication",
    icon: Mic,
    content: [
      {
        heading: "Coach on presentation skills",
        text: "Assist students in developing clear, confident oral presentations using visual aids.",
      },
      {
        heading: "Review defense protocols",
        text: "Ensure students understand procedural expectations, question handling, and time management.",
      },
      {
        heading: "Provide guidance for publication",
        text: "Support manuscript preparation, journal selection, and navigating submission processes.",
      },
    ],
  },
  {
    value: "section-career",
    title: "9. Career Development and Professional Networking",
    icon: Briefcase,
    content: [
      {
        heading: "Discuss Diverse Career Paths",
        text: "Help students explore careers beyond academia, including roles in industry, government, and entrepreneurship. Discuss how their research skills are transferable.",
      },
      {
        heading: "Build Professional Networks",
        text: "Encourage students to attend conferences (even virtually), connect with professionals on platforms like LinkedIn, and conduct informational interviews.",
      },
      {
        heading: "Mentor on Grant Writing and Funding",
        text: "When appropriate, involve students in the grant writing process. This provides invaluable experience in securing funding for future research.",
      },
      {
        heading: "Refine Digital Professional Presence",
        text: "Advise students on creating a professional LinkedIn profile that highlights their research skills, publications, and academic achievements.",
      },
    ],
  },
  {
    value: "section-7",
    title: "10. Upholding Academic Integrity and Ethical Standards",
    icon: ShieldCheck,
    content: [
      {
        heading: "Model ethical behavior",
        text: "Demonstrate transparency, fairness, and respect in all advisor-student interactions. Your conduct sets the standard for your students.",
      },
      {
        heading: "Educate on plagiarism and citation",
        text: "Go beyond just telling them to cite. Explain the nuances of paraphrasing vs. quoting and the importance of intellectual honesty.",
      },
      {
        heading: "Promote use of the Originality Checker",
        text: "Encourage students to use the platform's built-in Originality Checker as a learning tool to check their work before submitting drafts for your review.",
      },
      {
        heading: "Discuss Authorship and Data Ownership",
        text: "Have an early and open conversation about authorship on potential publications and the ownership of research data, according to institutional policies.",
      },
      {
        heading: "Guide through Ethical Review (IRB)",
        text: "If the research involves human or animal subjects, guide the student through the process of preparing and submitting their proposal to the Institutional Review Board or ethics committee.",
      },
    ],
  },
  {
    value: "section-8",
    title: "11. Leveraging Technology for Effective Advising",
    icon: Sparkles,
    content: [
      {
        heading: "Utilize ThesisAI for Thesis Management",
        text: "Centralize document submissions, feedback, and communication for efficiency and record-keeping. Use the platform to review drafts and track progress.",
      },
      {
        heading: "Understand the Student's Toolkit",
        text: "Be aware of the tools available to your students on this platform. They have access to AI-powered generators for topic ideas, outlines, and citations, as well as helpers for methodology, results, and conclusions. Encourage them to use these tools to overcome writer's block and structure their work.",
      },
      {
        heading: "Employ AI and writing aids thoughtfully",
        text: "Guide students in the ethical use of AI tools to enhance, not replace, their own critical thinking and research.",
      },
      {
        heading: "Facilitate remote advisory sessions",
        text: "Use video conferencing and collaborative platforms to maintain engagement beyond in-person meetings, complementing the asynchronous feedback you provide on this platform.",
      },
    ],
  },
];

const selfAssessmentItems = [
  {
    id: "sa-1",
    question: "Do I establish clear expectations with my students at the beginning of our mentorship?",
  },
  {
    id: "sa-2",
    question: "Do I provide timely, constructive, and actionable feedback on drafts?",
  },
  {
    id: "sa-3",
    question: "Am I aware of my students' individual progress and potential challenges?",
  },
  {
    id: "sa-4",
    question: "Do I foster an environment of open communication and trust?",
  },
  {
    id: "sa-5",
    question: "Do I encourage my students to develop independence and critical thinking skills?",
  },
  {
    id: "sa-6",
    question: "Am I up-to-date with my institution's policies and ethical guidelines for research?",
  },
  {
    id: "sa-7",
    question: "Do I recognize signs of student stress or burnout and know where to refer them for support?",
  },
];

export function AdvisorGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Advisor Guide: Supporting Student Success</CardTitle>
          <CardDescription>
            Welcome to the Advisor Guide, your comprehensive resource for effective mentorship. This guide provides best practices, practical tools, and strategies to support you in this rewarding role.
          </CardDescription>
        </CardHeader>
      </Card>

      <Accordion type="multiple" defaultValue={["section-1"]} className="w-full space-y-4">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <CheckSquare className="w-6 h-6 text-primary" />
            Mentorship Self-Assessment
          </CardTitle>
          <CardDescription>
            Use this checklist for periodic self-reflection on your advising practices. This is for your personal use and is not saved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selfAssessmentItems.map((item) => (
            <div key={item.id} className="flex items-start space-x-3">
              <Checkbox id={item.id} className="mt-1" />
              <Label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {item.question}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conclusion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your mentorship profoundly impacts students’ academic journeys and future careers. By applying these comprehensive strategies, you foster a supportive, productive, and ethical research environment that empowers students to realize their full potential. Thank you for dedicating your expertise, time, and care to advancing higher education through thoughtful thesis advising.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}