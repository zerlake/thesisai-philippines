import { LucideIcon } from "lucide-react";

export interface Stat {
  value: string;
  label: string;
  icon: string; // Will store the name of the Lucide icon as a string
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string; // Initials for now, will be updated later
}

export interface UniversityData {
  name: string;
  logo: string; // Text for now, will be updated to image paths later
}

export const stats: Stat[] = [
  { value: "10K+", label: "Students Empowered", icon: "Users" },
  { value: "99.9%", label: "Uptime Guarantee", icon: "TrendingUp" },
  { value: "4.9/5", label: "Average Rating", icon: "Star" },
  { value: "50+", label: "University Partners", icon: "GraduationCap" }
];

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Maria Santos",
    role: "MS Computer Science, UP Diliman",
    content: "ThesisAI cut my research time in half. The literature analyzer saved me countless hours of manual work.",
    avatar: "MS"
  },
  {
    id: 2,
    name: "Juan Dela Cruz",
    role: "PhD Education, Ateneo de Manila",
    content: "The citation manager is incredible. I never have to worry about formatting again.",
    avatar: "JD"
  },
  {
    id: 3,
    name: "Ana Garcia",
    role: "BS Psychology, DLSU",
    content: "The defense preparation tools helped me feel confident. My committee was impressed!",
    avatar: "AG"
  },
  {
    id: 4,
    name: "Rico Lopez",
    role: "BS Biology, UST",
    content: "As a STEM student, the data analysis features were a game-changer for my thesis.",
    avatar: "RL"
  }
];

export const universities: UniversityData[] = [
  { name: "UP", logo: "UP" },
  { name: "Ateneo", logo: "AD" },
  { name: "DLSU", logo: "DL" },
  { name: "UST", logo: "US" },
  { name: "FEU", logo: "FE" },
  { name: "UE", logo: "UE" },
  { name: "ADMU", logo: "AM" },
  { name: "MAPUA", logo: "MP" }
];