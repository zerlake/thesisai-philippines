// C:\Users\Projects\thesis-ai\src\tests\unit\advisor-dashboard.test.tsx

import { render, screen, waitFor } from "@testing-library/react";
import AdvisorDashboard from "../../components/advisor-dashboard";
import { Student, Milestone, Submission } from "../../@types";

const mockStudents: Student[] = [
  {
    id: "1",
    first_name: "John",
    last_name: "Doe",
    role: "user",
    advisor_id: "1",
  },
  {
    id: "2",
    first_name: "Jane",
    last_name: "Smith",
    role: "user",
    advisor_id: "1",
  },
];

const mockMilestones: Milestone[] = [
  {
    id: "1",
    student_id: "1",
    description: "Chapter 1",
    due_date: "2025-12-01",
    status: "In Progress",
  },
];

const mockSubmissions: Submission[] = [
  {
    id: "1",
    student_id: "1",
    milestone_id: "1",
    submission_date: "2025-11-15",
    status: "Submitted",
  },
];

describe("AdvisorDashboard Component Unit Test", () => {
  it("should render a list of students", async () => {
    render(
      <AdvisorDashboard
        students={mockStudents}
        milestones={mockMilestones}
        submissions={mockSubmissions}
        atRiskStudents={[]}
      />,
    );

    await waitFor(() => {
      for (const student of mockStudents) {
        expect(
          screen.getByText(`${student.first_name} ${student.last_name}`),
        ).toBeInTheDocument();
      }
    });
  });

  it("should display a message when there are no students", async () => {
    render(
      <AdvisorDashboard
        students={[]}
        milestones={[]}
        submissions={[]}
        atRiskStudents={[]}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/you have no students assigned/i),
      ).toBeInTheDocument();
    });
  });

  it("should highlight at-risk students", async () => {
    render(
      <AdvisorDashboard
        students={mockStudents}
        milestones={mockMilestones}
        submissions={mockSubmissions}
        atRiskStudents={[mockStudents[0]]}
      />,
    );

    const studentNameElement = await screen.findByText("John Doe");
    const studentCardElement = studentNameElement.closest(".student-card");

    await waitFor(() => {
      expect(studentCardElement).toHaveClass("bg-red-100 border-red-400");
    });
  });
});
