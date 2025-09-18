import { BookCopy, MessageSquare, Users, Heart, Sparkles } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export type CompetencyItem = {
  id: string;
  text: string;
};

export type Competency = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  items: CompetencyItem[];
};

export const advisorCompetencies: Competency[] = [
  {
    id: "subject-expertise",
    title: "Subject Matter and Research Expertise",
    icon: BookCopy,
    description: "Your knowledge in the field and understanding of research methodologies.",
    items: [
      { id: "se-1", text: "I am current with the latest research and developments in my field." },
      { id: "se-2", text: "I can guide students in selecting appropriate and rigorous research methodologies." },
      { id: "se-3", text: "I effectively help students refine their research questions to be focused and significant." },
      { id: "se-4", text: "I can identify potential flaws in research design and suggest viable solutions." },
    ],
  },
  {
    id: "communication",
    title: "Communication and Feedback",
    icon: MessageSquare,
    description: "How you communicate expectations, feedback, and guidance.",
    items: [
      { id: "cf-1", text: "I provide feedback that is constructive, specific, and actionable." },
      { id: "cf-2", text: "I communicate my expectations regarding timelines and quality of work clearly." },
      { id: "cf-3", text: "I am an active listener during meetings with my students." },
      { id: "cf-4", text: "My feedback is delivered in a timely manner." },
    ],
  },
  {
    id: "interpersonal",
    title: "Interpersonal and Mentoring Skills",
    icon: Users,
    description: "Your ability to build a positive and productive mentoring relationship.",
    items: [
      { id: "im-1", text: "I foster an environment where students feel comfortable discussing challenges." },
      { id: "im-2", text: "I help students develop their independence and confidence as researchers." },
      { id: "im-3", text: "I adapt my mentoring style to meet the individual needs of my students." },
      { id: "im-4", text: "I am approachable and accessible to my students for guidance." },
    ],
  },
  {
    id: "wellbeing",
    title: "Student Wellbeing and Support",
    icon: Heart,
    description: "Your role in supporting the student's overall academic and personal wellbeing.",
    items: [
      { id: "wb-1", text: "I recognize signs of student stress or burnout and discuss them constructively." },
      { id: "wb-2", text: "I promote a healthy work-life balance for my students." },
      { id: "wb-3", text: "I am aware of university support services (e.g., counseling) and can refer students when needed." },
      { id: "wb-4", text: "I celebrate student progress and milestones to maintain motivation." },
    ],
  },
  {
    id: "professionalism",
    title: "Professionalism and Ethics",
    icon: Sparkles,
    description: "Upholding the standards of academic and professional conduct.",
    items: [
      { id: "pe-1", text: "I model ethical research conduct and academic integrity." },
      { id: "pe-2", text: "I am familiar with and uphold university policies regarding research and supervision." },
      { id: "pe-3", text: "I help students navigate the process of ethical review (IRB) when necessary." },
      { id: "pe-4", text: "I provide guidance on future career paths and professional development." },
    ],
  },
];