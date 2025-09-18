import { Book, BrainCircuit, Briefcase, CheckSquare, Clock, Edit3, FlaskConical, FolderLock, Heart, Mic, ShieldAlert, ShieldCheck, Sparkles, Users } from "lucide-react";

export const advisorCompetencies = [
  {
    id: "subject-expertise",
    title: "Subject Matter Expertise",
    icon: Book,
    description: "Your knowledge and proficiency in the student's field of study.",
    items: [
      { id: "se-1", text: "I am current with the latest research and developments in my field." },
      { id: "se-2", text: "I can provide relevant and insightful guidance on the student's research topic." },
      { id: "se-3", text: "I am familiar with the key literature and theoretical frameworks relevant to the student's work." },
    ],
  },
  {
    id: "mentorship-skills",
    title: "Mentorship & Communication",
    icon: Users,
    description: "Your ability to guide, support, and communicate effectively with your students.",
    items: [
      { id: "ms-1", text: "I establish clear expectations and maintain open lines of communication." },
      { id: "ms-2", text: "I provide constructive, timely, and actionable feedback on student work." },
      { id: "ms-3", text: "I adapt my advising style to meet the individual needs of my students." },
      { id: "ms-4", text: "I foster a supportive and motivating environment for my students." },
    ],
  },
  {
    id: "research-guidance",
    title: "Research Process Guidance",
    icon: FlaskConical,
    description: "Your ability to guide students through the entire research lifecycle.",
    items: [
      { id: "rg-1", text: "I effectively assist students in refining their research questions and objectives." },
      { id: "rg-2", text: "I provide sound advice on research design, methodology, and data analysis." },
      { id: "rg-3", text: "I help students navigate challenges and overcome obstacles in their research." },
    ],
  },
  {
    id: "professional-development",
    title: "Professional & Career Development",
    icon: Briefcase,
    description: "Your role in preparing students for their future careers.",
    items: [
      { id: "pd-1", text: "I encourage students to present their work at conferences and seek publication." },
      { id: "pd-2", text: "I provide guidance on career paths and professional networking." },
      { id: "pd-3", text: "I help students develop transferable skills such as project management and critical thinking." },
    ],
  },
  {
    id: "ethical-conduct",
    title: "Ethical & Professional Conduct",
    icon: ShieldCheck,
    description: "Your commitment to upholding academic integrity and professional standards.",
    items: [
      { id: "ec-1", text: "I educate students on ethical research practices, including plagiarism and data management." },
      { id: "ec-2", text: "I model professional behavior and maintain appropriate boundaries." },
      { id: "ec-3", text: "I am knowledgeable about and adhere to institutional policies and guidelines." },
    ],
  },
];