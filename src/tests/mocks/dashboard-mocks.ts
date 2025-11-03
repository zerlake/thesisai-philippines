import { Student, Milestone, Submission } from "../../@types";

// Mock data for testing
export const mockStudent = {
  id: "test-student-id",
  first_name: "Test",
  last_name: "Student",
  role: "user",
  advisor_id: "test-advisor-id",
};

export const mockMilestones: Milestone[] = [
  {
    id: "m1",
    student_id: "test-student-id",
    description: "Complete thesis proposal",
    due_date: "2024-12-31",
    status: "Completed",
  },
  {
    id: "m2",
    student_id: "test-student-id",
    description: "Submit first draft",
    due_date: "2025-01-31",
    status: "In Progress",
  },
  {
    id: "m3",
    student_id: "test-student-id",
    description: "Final defense",
    due_date: "2025-05-15",
    status: "Not Started",
  },
];

export const mockSubmissions: Submission[] = [
  {
    id: "sub1",
    student_id: "test-student-id",
    milestone_id: "m1",
    submission_date: "2024-12-15",
    status: "Submitted",
  },
];

export const mockStudents: Student[] = [
  {
    id: "s1",
    first_name: "John",
    last_name: "Doe",
    role: "user",
    advisor_id: "test-advisor-id",
  },
  {
    id: "s2",
    first_name: "Jane",
    last_name: "Smith",
    role: "user",
    advisor_id: "test-advisor-id",
  },
];

export const mockAtRiskStudents: Student[] = [
  {
    id: "s3",
    first_name: "Bob",
    last_name: "Johnson",
    role: "user",
    advisor_id: "test-advisor-id",
  },
];

// Mock user profile
export const mockProfile = {
  id: "test-user-id",
  role: "user",
  first_name: "Test",
  last_name: "User",
  user_preferences: {
    dashboard_widgets: {
      stats: true,
      next_action: true,
      recent_activity: true,
      checklist: true,
      session_goal: true,
      writing_streak: true,
      milestones: true,
      quick_access: true,
      wellbeing: true,
      progress_milestones: true,
    }
  }
};

// Mock session
export const mockSession = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
  },
};

// Mock Supabase client
export const createMockSupabase = () => ({
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        order: (col: string, options: any) => ({
          limit: (limit: number) => ({
            single: () => Promise.resolve({ data: null, error: null }),
            then: (callback: any) => callback({ data: [], error: null })
          }),
          then: (callback: any) => callback({ data: [], error: null })
        }),
        in: (column: string, values: any[]) => ({
          eq: (col: string, val: any) => ({
            then: (callback: any) => callback({ data: [], error: null })
          })
        }),
        gte: (column: string, value: any) => ({
          then: (callback: any) => callback({ data: [], error: null })
        }),
        then: (callback: any) => callback({ data: [], error: null })
      }),
      then: (callback: any) => callback({ data: [], error: null })
    }),
    insert: (data: any) => ({
      then: (callback: any) => callback({ error: null }),
      select: () => ({
        then: (callback: any) => callback({ data: [], error: null })
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        then: (callback: any) => callback({ error: null })
      })
    })
  }),
  rpc: (funcName: string, params: any) => {
    if (funcName === "get_student_next_action") {
      return Promise.resolve({ 
        data: { 
          type: "feedback", 
          id: "feedback-1", 
          title: "Update introduction", 
          deadline: "2025-01-15" 
        }, 
        error: null 
      });
    }
    return Promise.resolve({ data: [], error: null });
  }
});

// Mock auth context
export const mockAuthContext = {
  supabase: createMockSupabase(),
  session: mockSession,
  profile: mockProfile,
  refreshProfile: () => Promise.resolve(),
};