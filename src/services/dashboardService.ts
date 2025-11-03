// C:\Users\Projects\thesis-ai\src\services\dashboardService.ts

/**
 * @file This file implements the contracts for the Dashboard Service, which is responsible
 * for fetching data for the Thesis Advisor's Dashboard from Supabase.
 */

import { Student, Milestone, Submission } from "../@types";
import { supabase } from "../integrations/supabase/client-with-error-handling";

/**
 * Fetches all students assigned to a specific advisor.
 *
 * @param advisorId The ID of the advisor.
 * @returns A promise that resolves to an array of Student objects.
 */
export async function getStudentsByAdvisor(
  advisorId: string,
): Promise<Student[]> {
  try {
    // 1. Get student_ids assigned to this advisor
    const { data: assignments, error: assignmentsError } = await supabase
      .from("advisor_student_relationships")
      .select("student_id")
      .eq("advisor_id", advisorId);

    if (assignmentsError) {
      // Handle network errors specifically
      if (assignmentsError.message && (assignmentsError.message.includes("Failed to fetch") || assignmentsError.message.includes("NetworkError"))) {
        console.warn("Network error fetching advisor assignments:", assignmentsError.message);
        return [];
      }
      console.error("Error fetching advisor assignments:", assignmentsError);
      return [];
    }

    const studentIds = assignments?.map((a) => a.student_id) || [];

    if (studentIds.length === 0) {
      return [];
    }

    // 2. Fetch profiles for these student_ids
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, role")
      .in("id", studentIds)
      .or("role.eq.user,role.eq.student"); // Ensure they are student profiles

    if (error) {
      // Handle network errors specifically
      if (error.message && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
        console.warn("Network error fetching student profiles:", error.message);
        return [];
      }
      console.error("Error fetching student profiles:", error);
      return [];
    }

    // Map the fetched profiles to the Student interface, adding advisor_id
    return (data || []).map((profile) => ({
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      role: profile.role,
      advisor_id: advisorId, // Assign the advisorId to each student
    }));
  } catch (error: any) {
    // Handle network errors from the fetch operation
    if (error.message && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
      console.warn("Network error in getStudentsByAdvisor:", error.message);
      return [];
    }
    console.error("Unexpected error in getStudentsByAdvisor:", error);
    return [];
  }
}

/**
 * Fetches all milestones for a specific student.
 *
 * @param studentId The ID of the student.
 * @returns A promise that resolves to an array of Milestone objects.
 */
export async function getMilestonesByStudent(
  studentId: string,
): Promise<Milestone[]> {
  try {
    const { data, error } = await supabase
      .from("milestones")
      .select("id, student_id, description, due_date, status")
      .eq("student_id", studentId);

    if (error) {
      // Handle network errors specifically
      if (error.message && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
        console.warn("Network error fetching milestones:", error.message);
        return [];
      }
      console.error("Error fetching milestones:", error);
      return [];
    }

    return data || [];
  } catch (error: any) {
    // Handle network errors from the fetch operation
    if (error.message && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
      console.warn("Network error in getMilestonesByStudent:", error.message);
      return [];
    }
    console.error("Unexpected error in getMilestonesByStudent:", error);
    return [];
  }
}

/**
 * Fetches all submissions for a specific student that are pending review.
 *
 * @param studentId The ID of the student.
 * @returns A promise that resolves to an array of Submission objects.
 */
export async function getPendingSubmissionsByStudent(
  studentId: string,
): Promise<Submission[]> {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("id, student_id, milestone_id, submission_date, status")
      .eq("student_id", studentId)
      .eq("status", "Submitted"); // Assuming 'Submitted' means pending review

    if (error) {
      // Handle network errors specifically
      if (error.message && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
        console.warn("Network error fetching pending submissions:", error.message);
        return [];
      }
      console.error("Error fetching pending submissions:", error);
      return [];
    }

    return data || [];
  } catch (error: any) {
    // Handle network errors from the fetch operation
    if (error.message && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
      console.warn("Network error in getPendingSubmissionsByStudent:", error.message);
      return [];
    }
    console.error("Unexpected error in getPendingSubmissionsByStudent:", error);
    return [];
  }
}

/**
 * Fetches at-risk students for a specific advisor based on a combination of factors.
 * Currently, a student is considered at-risk if they have any overdue and incomplete milestones.
 *
 * @param advisorId The ID of the advisor.
 * @returns A promise that resolves to an array of Student objects.
 */
export async function getAtRiskStudents(advisorId: string): Promise<Student[]> {
  try {
    // 1. Get student_ids assigned to this advisor
    const { data: assignments, error: assignmentsError } = await supabase
      .from("advisor_student_relationships")
      .select("student_id")
      .eq("advisor_id", advisorId);

    if (assignmentsError) {
      // Handle network errors specifically
      if (assignmentsError.message && (assignmentsError.message.includes("Failed to fetch") || assignmentsError.message.includes("NetworkError"))) {
        console.warn("Network error fetching advisor assignments for at-risk check:", assignmentsError.message);
        return [];
      }
      console.error(
        "Error fetching advisor assignments for at-risk check:",
        assignmentsError,
      );
      return [];
    }

    const studentIds = assignments?.map((a) => a.student_id) || [];

    if (studentIds.length === 0) {
      return [];
    }

    // 2. Fetch profiles for these student_ids
    const { data: students, error: studentsError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, role") // Select relevant profile fields
      .in("id", studentIds)
      .or("role.eq.user,role.eq.student"); // Ensure they are student profiles

    if (studentsError) {
      // Handle network errors specifically
      if (studentsError.message && (studentsError.message.includes("Failed to fetch") || studentsError.message.includes("NetworkError"))) {
        console.warn("Network error fetching student profiles for at-risk check:", studentsError.message);
        return [];
      }
      console.error(
        "Error fetching student profiles for at-risk check:",
        studentsError,
      );
      return [];
    }

    if (!students || students.length === 0) {
      return [];
    }

    const atRiskStudentIds: Set<string> = new Set();
    const now = new Date();

    for (const student of students) {
      const { data: milestones, error: milestonesError } = await supabase
        .from("milestones")
        .select("due_date, status")
        .eq("student_id", student.id);

      if (milestonesError) {
        // Handle network errors specifically
        if (milestonesError.message && (milestonesError.message.includes("Failed to fetch") || milestonesError.message.includes("NetworkError"))) {
          console.warn(`Network error fetching milestones for student ${student.id}:`, milestonesError.message);
          continue;
        }
        console.error(
          `Error fetching milestones for student ${student.id}:`,
          milestonesError,
        );
        continue;
      }

      const hasOverdueIncompleteMilestone = milestones?.some(
        (milestone) =>
          new Date(milestone.due_date) < now && milestone.status !== "Completed",
      );

      if (hasOverdueIncompleteMilestone) {
        atRiskStudentIds.add(student.id);
      }
    }

    // Map the fetched profiles to the Student interface, adding advisor_id
    return students
      .filter((student) => atRiskStudentIds.has(student.id))
      .map((profile) => ({
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
        advisor_id: advisorId, // Assign the advisorId to each student
      }));
  } catch (error: any) {
    // Handle network errors from the fetch operation
    if (error.message && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
      console.warn("Network error in getAtRiskStudents:", error.message);
      return [];
    }
    console.error("Unexpected error in getAtRiskStudents:", error);
    return [];
  }
}
