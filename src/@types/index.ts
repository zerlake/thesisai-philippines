// C:\Users\Projects\thesis-ai\src\@types\index.ts

export interface Advisor {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface Student {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  advisor_id: string;
}

export interface Milestone {
  id: string;
  student_id: string;
  description: string;
  due_date: string; // ISO 8601 date string
  status: "Not Started" | "In Progress" | "Completed";
}

export interface Submission {
  id: string;
  student_id: string;
  milestone_id: string;
  submission_date: string; // ISO 8601 date string
  status: "Draft" | "Submitted" | "Under-Review" | "Completed";
}
